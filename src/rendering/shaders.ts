/** Optical depth uses the same growing spheres and fade as simulation perception. */
const smokeGLSL = `
uniform int uDustCount;uniform vec4 uDust[4];uniform float uDustFade[4];
uniform int uSmokeCount;uniform vec4 uSmoke[12];uniform float uSmokeFade[12];
vec3 smokeColour(vec3 colour,vec3 origin,vec3 end){
 vec3 delta=end-origin;float len=length(delta);if(len<.0001||(uSmokeCount==0&&uDustCount==0))return colour;
 vec3 dir=delta/len;float depth=0.0;
 for(int i=0;i<12;i++){if(i>=uSmokeCount)break;vec3 offset=uSmoke[i].xyz-origin;
  float t=dot(offset,dir);float rr=uSmoke[i].w*uSmoke[i].w-dot(offset,offset)+t*t;
  if(rr<=0.0)continue;float halfChord=sqrt(rr);
  depth+=max(0.0,min(len,t+halfChord)-max(0.0,t-halfChord))*uSmokeFade[i];
 }
 colour=mix(colour,vec3(.64,.69,.68),1.0-exp(-depth*1.1));
 float dustDepth=0.0;
 for(int i=0;i<4;i++){if(i>=uDustCount)break;vec3 offset=uDust[i].xyz-origin;
  float t=dot(offset,dir);float rr=uDust[i].w*uDust[i].w-dot(offset,offset)+t*t;
  if(rr<=0.0)continue;float halfChord=sqrt(rr);
  dustDepth+=max(0.0,min(len,t+halfChord)-max(0.0,t-halfChord))*uDustFade[i];
 }
 return mix(colour,vec3(.58,.54,.46),min(.38,1.0-exp(-dustDepth*.12)));
}`;
export const fragment = `#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vColour;in vec3 vWorld;in vec3 vNormal;in vec3 vSurface;in vec3 vSurfaceNormal;in float vGlow;flat in float vMaterial;
uniform vec3 uEye,uSky,uSun,uSunTint;uniform float uDistance,uExposure,uTime,uTextures,uShadows,uAmbient,uDirect,uNoFog;
uniform mat4 uLight;uniform sampler2D uShadow;uniform sampler2DArray uMaterials;out vec4 outColour;
${smokeGLSL}
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
vec3 skyColour(vec3 ray){float h=clamp(ray.y*.65+.35,0.0,1.0);return mix(uSky,vec3(.30,.53,.74),pow(h,1.3));}
float shadow(vec3 n){
 if(uShadows<.5)return 1.0;
 vec4 ls=uLight*vec4(vWorld,1.0);vec3 p=ls.xyz/ls.w*.5+.5;
 if(any(lessThan(p,vec3(.001)))||any(greaterThan(p,vec3(.999))))return 1.0;
 float bias=max(.00022,.00095*(1.0-max(dot(n,uSun),0.0))),s=0.0;vec2 t=1.0/vec2(textureSize(uShadow,0));
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=p.z-bias<=texture(uShadow,p.xy+vec2(float(x),float(y))*t).r?1.0:0.0;
 float fade=smoothstep(.01,.10,min(min(p.x,p.y),min(1.0-p.x,1.0-p.y)));
 return mix(1.0,s/9.0,fade);
}
void main(){
 vec3 n=normalize(vNormal),base=max(vColour,vec3(0.0)),localN=normalize(vSurfaceNormal);
 float mat=mod(vMaterial,32.0);bool broken=vMaterial>31.5;
 vec2 uv=abs(localN.y)>.6?vSurface.xz:abs(localN.x)>.6?vSurface.zy:vSurface.xy;
 float scale=mat==5.0?1.0:mat==6.0?.65:mat==11.0||mat==16.0?.5:mat==8.0?1.25:.5;
 vec4 tex=texture(uMaterials,vec3(uv*scale,clamp(mat,0.0,18.0)));
 float roughness=tex.a;float shade=mix(1.0,tex.r*1.7,uTextures*step(.5,mat));base*=shade;
 // Local/rest coordinates keep cracks and patterns attached to moving chunks.
 if(broken){float crack=abs(sin(uv.x*11.0+sin(uv.y*9.0)*1.7));base*=.91+.09*hash(floor(vSurface*9.0));base*=1.0-(1.0-smoothstep(.02-fwidth(crack),.085+fwidth(crack),crack))*.23;}
 if(mat==4.0||mat==5.0)base*=.90+.14*hash(floor(vSurface/24.0));
 vec3 viewDir=normalize(uEye-vWorld);
 bool glass=mat==11.0||mat==16.0;bool water=mat==17.0;
 if(water){n=normalize(n+vec3(sin(vWorld.z*1.8+uTime*1.1)*.11,0.0,cos(vWorld.x*2.2-uTime*.9)*.11));roughness=.21;}
 float sunAmount=max(dot(n,uSun),0.0),sh=shadow(n);
 float hemisphere=.38+.30*max(n.y,0.0);
 float fill=max(dot(n,normalize(vec3(.75,.3,-.8))),0.0)*.24;
 vec3 linear=pow(max(base,vec3(0.0)),vec3(2.2));
 vec3 lit=linear*(vec3(.88,.97,1.09)*(hemisphere+fill)*uAmbient*mix(.78,1.0,sh)+uSunTint*sunAmount*1.38*uDirect*sh);
 float spec=pow(max(dot(n,normalize(uSun+viewDir)),0.0),mix(14.0,100.0,1.0-roughness));
 float fresnel=pow(1.0-max(dot(n,viewDir),0.0),5.0);
 if(glass||water){vec3 env=pow(skyColour(reflect(-viewDir,n)),vec3(2.2));lit=mix(lit,env,(water?.28:.24)+fresnel*.5);lit+=uSunTint*spec*sh*.75*uDirect;}
 else if(mat==12.0||mat==10.0){lit+=uSunTint*spec*sh*.10;}
 lit+=linear*clamp(vGlow,0.0,4.0)*2.8;
 vec3 colour=pow(vec3(1.0)-exp(-max(lit,vec3(0.0))*uExposure*1.35),vec3(1.0/2.2));
 float fog=smoothstep(uDistance*.42,uDistance,length(vWorld-uEye))*.93*(1.0-uNoFog);
 colour=mix(colour,uSky,fog);if(uNoFog<.5)colour=smokeColour(colour,uEye,vWorld);outColour=vec4(colour,1.0);
}`;
const outputs = `out vec3 vColour;out vec3 vWorld;out vec3 vNormal;out vec3 vSurface;out vec3 vSurfaceNormal;out float vGlow;flat out float vMaterial;`;
export const staticVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in float aMaterial;
uniform mat4 uVP;${outputs}
void main(){vWorld=aPosition;vSurface=aPosition;vSurfaceNormal=aNormal;vNormal=aNormal;vColour=aColour;vGlow=0.0;vMaterial=aMaterial;gl_Position=uVP*vec4(aPosition,1.0);}`;
export const sectionVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in float aMaterial;
uniform mat4 uVP,uModel;uniform vec3 uMaterialOrigin;${outputs}
void main(){vWorld=(uModel*vec4(aPosition,1.0)).xyz;vSurface=aPosition+uMaterialOrigin;vSurfaceNormal=aNormal;vNormal=mat3(uModel)*aNormal;vColour=aColour;vGlow=0.0;vMaterial=aMaterial;gl_Position=uVP*vec4(vWorld,1.0);}`;
export const instanceVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in vec3 aOffset;layout(location=4)in vec3 aSize;layout(location=5)in vec3 aRotation;layout(location=6)in float aGlow;layout(location=7)in float aMaterial;
uniform mat4 uVP;${outputs}
vec3 turn(vec3 p){float c,s;if(aRotation.z!=0.0){c=cos(aRotation.z);s=sin(aRotation.z);p=vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}c=cos(aRotation.y);s=sin(aRotation.y);p=vec3(p.x,c*p.y+s*p.z,-s*p.y+c*p.z);c=cos(aRotation.x);s=sin(aRotation.x);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
void main(){vSurface=aPosition*aSize;vSurfaceNormal=aNormal;vWorld=aOffset+turn(aPosition*aSize);vNormal=turn(aNormal);vColour=aColour;vGlow=aGlow;vMaterial=aMaterial;gl_Position=uVP*vec4(vWorld,1.0);}`;
export const depthFragment = `#version 300 es
precision highp float;void main(){}`;
export const skyVertex = `#version 300 es
precision highp float;out vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.0-1.0,1.0,1.0);}`;
export const skyFragment = `#version 300 es
precision highp float;in vec2 uv;out vec4 outColour;
uniform vec3 uEye,uForward,uRight,uUp,uSun,uSky,uSunTint;uniform float uAspect,uTan,uTime,uClouds;
${smokeGLSL}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
void main(){vec2 q=uv*2.0-1.0;vec3 ray=normalize(uForward+uRight*q.x*uAspect*uTan+uUp*q.y*uTan);
 vec3 c=mix(uSky,vec3(.30,.53,.74),pow(clamp(ray.y*.65+.35,0.0,1.0),1.3));
 float sun=pow(max(dot(ray,uSun),0.0),640.0);float halo=pow(max(dot(ray,uSun),0.0),24.0);
 c+=uSunTint*(sun*.65+halo*.08)*(1.0-uClouds*.7);
 if(ray.y>.04){vec2 p=ray.xz/(ray.y+.17)*2.2+vec2(uTime*.002,0);float cloud=noise(p)*.65+noise(p*2.4)*.25+noise(p*5.3)*.10;float mask=smoothstep(.51-uClouds*.2,.8-uClouds*.18,cloud)*smoothstep(.04,.28,ray.y);c=mix(c,vec3(.93,.94,.94),mask*(.55+uClouds*.3));}
 outColour=vec4(smokeColour(c,uEye,uEye+ray*620.0),1.0);}`;
export const faces = [
  [
    [1, 0, 0],
    [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ],
  ],
  [
    [-1, 0, 0],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
  ],
  [
    [0, 1, 0],
    [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  [
    [0, -1, 0],
    [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1],
    ],
  ],
  [
    [0, 0, 1],
    [
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  [
    [0, 0, -1],
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
] as const;
export const tri = [0, 1, 2, 0, 2, 3];
