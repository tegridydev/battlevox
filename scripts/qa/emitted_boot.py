"""Boot the emitted HTML itself, retaining parser timing and CSP.

The native pass exercises WebGL when available and checks the visible failure route otherwise.
The instrumented pass proves that the actual standalone entry reaches the front end, without
claiming GPU correctness. --require-gpu makes missing WebGL a release-blocking failure.
"""
import argparse
import json
import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_fixture import prepare_fixture

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.cache/qa'
parser = argparse.ArgumentParser()
parser.add_argument('--require-gpu', action='store_true')
args = parser.parse_args()
html = (ROOT / 'PLAY.html').read_text()
shell = (ROOT / 'index.html').read_text()
css = (ROOT / 'src/ui/styles.css').read_text()
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH'), headless=True, args=['--no-sandbox'])
    for instrumented in [False, True]:
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.set_default_timeout(45000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        gpu = page.evaluate("!!document.createElement('canvas').getContext('webgl2')")
        if instrumented:
            prepare_fixture(page, shell, css)
            page.evaluate('()=>{window.__realRAF=requestAnimationFrame.bind(window);window.__realCancel=cancelAnimationFrame.bind(window)}')
            page.add_script_tag(content=(OUT / 'browser-harness.js').read_text())
            page.evaluate("async()=>{window.__bootFixture=await __load('tests/browser.ts').browserFixture();window.requestAnimationFrame=__realRAF;window.cancelAnimationFrame=__realCancel}")
        page.evaluate("""()=>{
          const original=HTMLCanvasElement.prototype.getContext;window.__contexts=[];
          Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{configurable:true,value:function(type,...args){
            __contexts.push({type,bodyReady:!!document.getElementById('world')&&!!document.getElementById('hud')});
            return original.call(this,type,...args);
          }});
        }""")
        try:
            page.set_content(html, wait_until='domcontentloaded')
            deadline = time.monotonic() + 45
            while not page.evaluate("() => document.getElementById('loading').hidden || !document.getElementById('error').hidden"):
                if time.monotonic() > deadline:
                    raise TimeoutError('Emitted document did not complete startup within 45 seconds')
                page.wait_for_timeout(100)
            state = page.evaluate("""()=>({contexts:__contexts,error:document.getElementById('error').hidden?null:document.getElementById('error').textContent,
              home:!document.getElementById('overlay').hidden&&!document.querySelector('[data-page=home]').hidden,
              loadingHidden:document.getElementById('loading').hidden,policy:document.querySelector('[http-equiv=Content-Security-Policy]')?.content})""")
            ready = bool(state['contexts']) and all(c['bodyReady'] for c in state['contexts'])
            expected_failure = not instrumented and not gpu
            success = ready and not errors and state['loadingHidden'] and (
                bool(state['error']) and 'WebGL 2 is unavailable' in state['error'] if expected_failure else state['home'] and not state['error'])
            results.append({'mode': 'instrumented emitted document' if instrumented else 'native emitted document',
                            'gpuAvailable': gpu, 'status': 'pass' if success else 'fail', 'state': state, 'uncaught': errors})
            if instrumented:
                page.screenshot(path=str(OUT / 'emitted-home.png'))
            if args.require_gpu and not instrumented and not gpu:
                results.append({'mode': 'required native GPU gate', 'status': 'fail', 'reason': 'WebGL 2 unavailable'})
        except Exception as error:
            results.append({'mode': 'instrumented' if instrumented else 'native', 'status': 'fail', 'error': str(error), 'uncaught': errors})
        page.close()
    browser.close()
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'emitted-boot.json').write_text(json.dumps(results, indent=2))
for row in results:
    print(row['status'].upper(), row['mode'], row.get('reason', row.get('error', '')))
raise SystemExit(1 if any(r['status'] == 'fail' for r in results) else 0)
