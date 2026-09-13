"""Optional Linux EGL/GLES 3 shader check using system libraries and ctypes.

This compiles the actual shader sources with Mesa when available and renders two small
smoke-depth probes. It does NOT certify browser WebGL, hardware performance, or a full scene.
No packages, drivers or network resources are downloaded. Missing EGL is a failed optional gate.
"""
import ctypes as C
import ctypes.util
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.cache/qa'
OUT.mkdir(parents=True, exist_ok=True)
report = {'scope': 'Native EGL/GLES compilation and smoke pixels; not browser or hardware validation',
          'programs': [], 'pixels': []}
egl = gl = None
display = surface = context = None
programs = []


def function(lib, name, result, *args):
    fn = getattr(lib, name)
    fn.restype = result
    fn.argtypes = list(args)
    return fn


try:
    source = subprocess.check_output(['node', '-e', r"""
      const fs=require('node:fs'),vm=require('node:vm');
      const ts=require('./scripts/compiler.cjs').loadTypeScript();
      const code=ts.transpileModule(fs.readFileSync('src/rendering/shaders.ts','utf8'),{
        compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
      const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod});
      console.log(JSON.stringify(mod.exports));
    """], cwd=ROOT, env=os.environ, text=True)
    shaders = json.loads(source)
    egl = C.CDLL(ctypes.util.find_library('EGL') or 'libEGL.so.1')
    gl = C.CDLL(ctypes.util.find_library('GLESv2') or ctypes.util.find_library('OpenGL') or 'libGLESv2.so.2')
    get_proc = function(egl, 'eglGetProcAddress', C.c_void_p, C.c_char_p)
    platform = get_proc(b'eglGetPlatformDisplayEXT')
    if not platform:
        raise RuntimeError('Surfaceless EGL entry point unavailable')
    display = C.CFUNCTYPE(C.c_void_p, C.c_uint, C.c_void_p, C.POINTER(C.c_int))(platform)(0x31DD, None, None)
    initialise = function(egl, 'eglInitialize', C.c_uint, C.c_void_p, C.POINTER(C.c_int), C.POINTER(C.c_int))
    major, minor = C.c_int(), C.c_int()
    if not initialise(display, C.byref(major), C.byref(minor)):
        raise RuntimeError('Surfaceless EGL initialisation failed')
    if not function(egl, 'eglBindAPI', C.c_uint, C.c_uint)(0x30A0):
        raise RuntimeError('EGL cannot bind the OpenGL ES API')
    # Pbuffer + GLES 3 with an RGBA8 colour buffer.
    attributes = (C.c_int * 15)(0x3033, 1, 0x3040, 0x40, 0x3024, 8, 0x3023, 8,
                              0x3022, 8, 0x3021, 8, 0x3025, 0, 0x3038)
    config, count = C.c_void_p(), C.c_int()
    choose = function(egl, 'eglChooseConfig', C.c_uint, C.c_void_p, C.POINTER(C.c_int),
                      C.POINTER(C.c_void_p), C.c_int, C.POINTER(C.c_int))
    if not choose(display, attributes, C.byref(config), 1, C.byref(count)) or not count.value:
        raise RuntimeError('No GLES 3 RGBA8 pbuffer configuration')
    create_context = function(egl, 'eglCreateContext', C.c_void_p, C.c_void_p, C.c_void_p,
                              C.c_void_p, C.POINTER(C.c_int))
    context = create_context(display, config, None, (C.c_int * 3)(0x3098, 3, 0x3038))
    create_surface = function(egl, 'eglCreatePbufferSurface', C.c_void_p, C.c_void_p,
                              C.c_void_p, C.POINTER(C.c_int))
    surface = create_surface(display, config, (C.c_int * 5)(0x3057, 1, 0x3056, 1, 0x3038))
    current = function(egl, 'eglMakeCurrent', C.c_uint, C.c_void_p, C.c_void_p, C.c_void_p, C.c_void_p)
    if not context or not surface or not current(display, surface, surface, context):
        raise RuntimeError('Unable to activate the GLES context')
    get_string = function(gl, 'glGetString', C.c_char_p, C.c_uint)
    report.update(egl=f'{major.value}.{minor.value}', renderer=get_string(0x1F01).decode(),
                  version=get_string(0x1F02).decode(), shadingLanguage=get_string(0x8B8C).decode())
    create_shader = function(gl, 'glCreateShader', C.c_uint, C.c_uint)
    shader_source = function(gl, 'glShaderSource', None, C.c_uint, C.c_int,
                             C.POINTER(C.c_char_p), C.POINTER(C.c_int))
    compile_shader = function(gl, 'glCompileShader', None, C.c_uint)
    shader_iv = function(gl, 'glGetShaderiv', None, C.c_uint, C.c_uint, C.POINTER(C.c_int))
    shader_log = function(gl, 'glGetShaderInfoLog', None, C.c_uint, C.c_int,
                          C.POINTER(C.c_int), C.c_void_p)
    delete_shader = function(gl, 'glDeleteShader', None, C.c_uint)
    create_program = function(gl, 'glCreateProgram', C.c_uint)
    attach = function(gl, 'glAttachShader', None, C.c_uint, C.c_uint)
    link = function(gl, 'glLinkProgram', None, C.c_uint)
    program_iv = function(gl, 'glGetProgramiv', None, C.c_uint, C.c_uint, C.POINTER(C.c_int))
    program_log = function(gl, 'glGetProgramInfoLog', None, C.c_uint, C.c_int,
                           C.POINTER(C.c_int), C.c_void_p)
    delete_program = function(gl, 'glDeleteProgram', None, C.c_uint)

    def compile_program(vertex, fragment):
        program = create_program()
        programs.append(program)
        for kind, text in [(0x8B31, vertex), (0x8B30, fragment)]:
            shader = create_shader(kind)
            try:
                code = C.c_char_p(text.encode())
                shader_source(shader, 1, C.byref(code), None)
                compile_shader(shader)
                ok = C.c_int()
                shader_iv(shader, 0x8B81, C.byref(ok))
                if not ok.value:
                    log = C.create_string_buffer(16384)
                    shader_log(shader, len(log), None, log)
                    raise RuntimeError(log.value.decode())
                attach(program, shader)
            finally:
                delete_shader(shader)
        link(program)
        ok = C.c_int()
        program_iv(program, 0x8B82, C.byref(ok))
        if not ok.value:
            log = C.create_string_buffer(16384)
            program_log(program, len(log), None, log)
            raise RuntimeError(log.value.decode())
        return program

    for name, vs, frag in [
        ('terrain', 'staticVertex', 'fragment'), ('sections', 'sectionVertex', 'fragment'),
        ('instances', 'instanceVertex', 'fragment'), ('terrain depth', 'staticVertex', 'depthFragment'),
        ('section depth', 'sectionVertex', 'depthFragment'),
        ('instance depth', 'instanceVertex', 'depthFragment'), ('sky', 'skyVertex', 'skyFragment')
    ]:
        try:
            compile_program(shaders[vs], shaders[frag])
            report['programs'].append({'name': name, 'status': 'pass'})
        except RuntimeError as error:
            report['programs'].append({'name': name, 'status': 'fail', 'error': str(error)})

    # Reuse the exact shared smoke helper, not a separate copy of its implementation.
    fragment = shaders['fragment']
    helper = fragment[fragment.index('uniform int uSmokeCount'):fragment.index('float hash')]
    program = compile_program(shaders['skyVertex'], '#version 300 es\nprecision highp float;\n' +
                              helper + '\nuniform vec3 uTarget;out vec4 outColour;\n' +
                              'void main(){outColour=vec4(smokeColour(vec3(1),vec3(0),uTarget),1);}')
    function(gl, 'glUseProgram', None, C.c_uint)(program)
    function(gl, 'glViewport', None, C.c_int, C.c_int, C.c_int, C.c_int)(0, 0, 1, 1)
    location = function(gl, 'glGetUniformLocation', C.c_int, C.c_uint, C.c_char_p)
    function(gl, 'glUniform1i', None, C.c_int, C.c_int)(location(program, b'uSmokeCount'), 1)
    function(gl, 'glUniform4f', None, C.c_int, C.c_float, C.c_float, C.c_float, C.c_float)(
        location(program, b'uSmoke[0]'), 0, 0, 5, 2)
    function(gl, 'glUniform1f', None, C.c_int, C.c_float)(location(program, b'uSmokeFade[0]'), 1)
    target = function(gl, 'glUniform3f', None, C.c_int, C.c_float, C.c_float, C.c_float)
    draw = function(gl, 'glDrawArrays', None, C.c_uint, C.c_int, C.c_int)
    read = function(gl, 'glReadPixels', None, C.c_int, C.c_int, C.c_int, C.c_int,
                    C.c_uint, C.c_uint, C.c_void_p)
    for name, z, expected in [('foreground remains clear', 1, (255, 255, 255)),
                             ('background inside smoke is attenuated', 10, (164, 177, 174))]:
        target(location(program, b'uTarget'), 0, 0, z)
        draw(4, 0, 3)
        pixel = (C.c_ubyte * 4)()
        read(0, 0, 1, 1, 0x1908, 0x1401, pixel)
        values = list(pixel)
        passed = all(abs(values[i] - expected[i]) <= 2 for i in range(3)) and values[3] == 255
        report['pixels'].append({'name': name, 'rgba': values, 'status': 'pass' if passed else 'fail'})
    error = function(gl, 'glGetError', C.c_uint)()
    report['glError'] = hex(error)
    report['status'] = 'pass' if not error and all(
        item['status'] == 'pass' for item in report['programs'] + report['pixels']) else 'fail'
except Exception as error:
    report.update(status='fail', error=str(error))
finally:
    if gl and context:
        for program in programs:
            function(gl, 'glDeleteProgram', None, C.c_uint)(program)
    if egl and display:
        function(egl, 'eglMakeCurrent', C.c_uint, C.c_void_p, C.c_void_p, C.c_void_p, C.c_void_p)(display, None, None, None)
        if surface:
            function(egl, 'eglDestroySurface', C.c_uint, C.c_void_p, C.c_void_p)(display, surface)
        if context:
            function(egl, 'eglDestroyContext', C.c_uint, C.c_void_p, C.c_void_p)(display, context)
        function(egl, 'eglTerminate', C.c_uint, C.c_void_p)(display)
    (OUT / 'shader-egl.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
sys.exit(0 if report.get('status') == 'pass' else 1)
