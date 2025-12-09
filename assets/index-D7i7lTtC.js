var e=Object.defineProperty,t=t=>{let n={};for(var r in t)e(n,r,{get:t[r],enumerable:!0});return n};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(e,t,n){let r=1e3/60,i=performance.now(),a=0;function o(s){requestAnimationFrame(o);let c=Math.min(s-i,25);for(i=s,a+=c;a>=r;)e(r),a-=r;t(a/r),n?.()}requestAnimationFrame(o)}function r(e,t){let n=e=>{if(e.clientX||e.clientX===0)return[e.clientX,e.clientY]},r=e=>{let[t,r]=n(e)??[0,0];return[(t-s.left)/s.width,(r-s.top)/s.height]};function i(n){e.setPointerCapture(n.pointerId);let i=r(n);t.on_down(i)}function a(e){let n=r(e);t.on_up(n)}function o(e){let n=r(e);t.on_move(n)}let s;c();function c(){s=e.getBoundingClientRect()}function l(){c()}e.addEventListener(`pointerdown`,i,{passive:!1}),e.addEventListener(`pointermove`,o,{passive:!1}),document.addEventListener(`pointerup`,a),new ResizeObserver(c).observe(e),document.addEventListener(`scroll`,l,{capture:!0,passive:!0}),window.addEventListener(`resize`,l,{passive:!0})}function i(e){let t=[0,0],n,i,a,o,s=!1,c=0;function l(t){return[t[0]*e.width,t[1]*e.height]}return r(e,{on_down(e){e=l(e),i=void 0,n=e,a=e,s=!1},on_up(e){e=l(e),n=void 0,i=e},on_move(e){if(e=l(e),t=e,n){let t=n[0]-e[0],r=n[1]-e[1];t*t+r*r>64&&(s=!0)}}}),{get is_hovering(){return t},get is_down(){return n},get is_up(){return i},get is_just_down(){return a},get is_double_click(){return o},get has_moved_after_last_down(){return s},update(e){o=void 0,a&&c>0&&(o=a,c=0),c-=e,a=void 0,i=void 0}}}var a=class e{renderer;static INSTANCE_STRIDE=15;maxInstances;buffer;cursor=0;constructor(t,n=8192){this.renderer=t,this.maxInstances=n,this.buffer=new Float32Array(n*e.INSTANCE_STRIDE)}beginFrame(){this.cursor=0}endFrame(){this.flush()}ensureCapacity(e){if(this.cursor+e>this.maxInstances&&(this.flush(),e>this.maxInstances))throw Error(`Requested instance count exceeds maxInstances`)}pushInstance(t){let n=this.cursor*e.INSTANCE_STRIDE;for(let r=0;r<e.INSTANCE_STRIDE;r++)this.buffer[n+r]=t[r]??0;this.cursor++}fillRect(e,t,n,r,i,a=0){this.ensureCapacity(1),this.pushInstance([e,t,n,r,a,i.r,i.g,i.b,i.a,0,0,0,0,0,0])}fillRoundRect(e,t,n,r,i,a,o=0){this.ensureCapacity(1),this.pushInstance([e,t,n,r,o,a.r,a.g,a.b,a.a,1,i,0,0,0,0])}strokeRoundRect(e,t,n,r,i,a,o,s=[0,0],c=0){this.ensureCapacity(1),this.pushInstance([e,t,n+a,r+a,c,o.r,o.g,o.b,o.a,1,i,a,s[0],s[1],0])}strokeRect(e,t,n,r,i,a,o=[0,0],s=0){this.ensureCapacity(1),this.pushInstance([e,t,n+i,r+i,s,a.r,a.g,a.b,a.a,0,0,i,o[0],o[1],0])}strokeLine(e,t,n,r,i,a,o=[0,0]){this.ensureCapacity(1);let s=n-e,c=r-t,l=Math.hypot(s,c),u=Math.atan2(c,s),d=l+i+8,f=i+8,p=(e+n)*.5,m=(t+r)*.5,ee=i*.5;this.pushInstance([p,m,d,f,u,a.r,a.g,a.b,a.a,2,ee,0,o[0],o[1],l])}flush(){if(this.cursor===0)return;let t=this.cursor*e.INSTANCE_STRIDE,n=this.buffer.subarray(0,t);this.renderer.instanceData.length>=t?this.renderer.instanceData.set(n,0):this.renderer.instanceData=new Float32Array(n),this.renderer.instanceCount=this.cursor,this.renderer.flush(),this.cursor=0}},o=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_pos;            
layout(location = 1) in vec2 a_translation;    
layout(location = 2) in vec2 a_size;           
layout(location = 3) in float a_rotation;      
layout(location = 4) in vec4 a_color;          
layout(location = 5) in float a_type;          
layout(location = 6) in float a_radius;        
layout(location = 7) in float a_stroke;        
layout(location = 8) in vec2 a_dash;           
layout(location = 9) in float a_length;        

out vec2 v_local;
out vec2 v_size;
out vec4 v_color;
out float v_type;
out float v_radius;
out float v_stroke;
out vec2 v_dash;
out float v_length;

uniform vec2 u_resolution; 

void main() {
    
    vec2 local = (a_pos - 0.5) * a_size;
    v_local = local;
    v_size = a_size;

    
    v_color = a_color;
    v_type = a_type;
    v_radius = a_radius;
    v_stroke = a_stroke;
    v_dash = a_dash;
    v_length = a_length;

    
    float s = sin(a_rotation);
    float c = cos(a_rotation);
    vec2 rotated = vec2(
        local.x * c - local.y * s,
        local.x * s + local.y * c
    );

    
    vec2 world = rotated + a_translation;

    
    vec2 ndc = (world / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(ndc * vec2(1, -1), 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;

in vec2 v_local;
in vec2 v_size;
in vec4 v_color;
in float v_type;
in float v_radius;
in float v_stroke;
in vec2 v_dash;
in float v_length;

out vec4 fragColor;

float sdRect(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return max(d.x, d.y);
}

float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return length(max(d, 0.0)) - r;
}

float sdCapsule(vec2 p, float len, float r) {
    
    vec2 a = vec2(-len * 0.5, 0.0);
    vec2 b = vec2( len * 0.5, 0.0);
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float applyDash(float distAlongLine, float dash, float gap) {
    float total = dash + gap;
    float m = mod(distAlongLine, total);
    return (m < dash) ? 1.0 : 0.0;
}

void main() {

    
    vec2 p = v_local;

    float d = 0.0;

    
    
    
    if (v_type == 0.0) {
        d = sdRect(p, v_size * 0.5);
    }

    
    
    
    if (v_type == 1.0) {
        d = sdRoundRect(p, v_size * 0.5 - vec2(v_radius), v_radius);
    }

    
    
    
    if (v_type == 2.0) {
        
        d = sdCapsule(p, v_length, v_radius);
    }

    
    
    
    float alpha = 0.0;

    if (v_stroke == 0.0) {
        
        float edge = fwidth(d);
        alpha = 1.0 - smoothstep(0.0, edge, d);

    } else {
        
        float halfStroke = v_stroke * 0.5;
        float distToStroke = abs(d) - halfStroke;
        float edge = fwidth(distToStroke);
        alpha = 1.0 - smoothstep(0.0, edge, distToStroke);

        
        
        
        if (v_dash.x > 0.0) {
            
            
            float distAxis = (v_type == 2.0)
                ? (p.x + v_length * 0.5)
                : abs(p.x) + abs(p.y);

            float dashMask = applyDash(distAxis, v_dash.x, v_dash.y);
            alpha *= dashMask;
        }
    }

    fragColor = vec4(v_color.rgb, v_color.a * alpha);
}`,c=class{gl;program;vao;quadVBO;instanceVBO;maxInstances;instanceStride;instanceData;instanceCount=0;uResolution;constructor(e,t=1e4){let n=e.getContext(`webgl2`,{antialias:!0});if(!n)throw Error(`WebGL2 not supported`);this.gl=n,this.maxInstances=t,this.quadVBO=n.createBuffer(),this.instanceVBO=n.createBuffer(),this.program=this.createProgram(o,s),this.uResolution=n.getUniformLocation(this.program,`u_resolution`),this.instanceStride=15,this.instanceData=new Float32Array(this.maxInstances*this.instanceStride),this.vao=this.createVAO(),n.enable(n.BLEND),n.blendFunc(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA)}createVAO(){let e=this.gl,t=e.createVertexArray();e.bindVertexArray(t);let n=new Float32Array([0,0,1,0,0,1,1,1]);return e.bindBuffer(e.ARRAY_BUFFER,this.quadVBO),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,8,0),e.vertexAttribDivisor(0,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceVBO),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW),t}setupInstancing(){let e=this.gl;e.bindVertexArray(this.vao),e.bindBuffer(e.ARRAY_BUFFER,this.instanceVBO);let t=this.instanceStride*4,n=0,r=1,i=i=>{e.enableVertexAttribArray(r),e.vertexAttribPointer(r,i,e.FLOAT,!1,t,n),e.vertexAttribDivisor(r,1),n+=i*4,r++};i(2),i(2),i(1),i(4),i(1),i(1),i(1),i(2),i(1)}addInstance(e){let t=this.instanceCount*this.instanceStride;this.instanceData.set(e,t),this.instanceCount++,this.instanceCount>=this.maxInstances&&console.warn(`Instance buffer full`)}flush(){let e=this.gl;this.instanceCount!==0&&(e.useProgram(this.program),e.bindVertexArray(this.vao),e.uniform2f(this.uResolution,e.canvas.width,e.canvas.height),e.bindBuffer(e.ARRAY_BUFFER,this.instanceVBO),e.bufferSubData(e.ARRAY_BUFFER,0,this.instanceData.subarray(0,this.instanceCount*this.instanceStride)),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,this.instanceCount),this.instanceCount=0)}createProgram(e,t){let n=this.gl,r=n.createShader(n.VERTEX_SHADER);if(n.shaderSource(r,e),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS))throw Error(n.getShaderInfoLog(r));let i=n.createShader(n.FRAGMENT_SHADER);if(n.shaderSource(i,t),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS))throw Error(n.getShaderInfoLog(i));let a=n.createProgram();if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS))throw Error(n.getProgramInfoLog(a));return n.deleteShader(r),n.deleteShader(i),a}};let l,u;function d(){let e=document.createElement(`canvas`);e.width=1920,e.height=1080;let t=new c(e,32768);return t.setupInstancing(),u=new a(t,16384),l=i(e),e}function f(e=0,t=0){return{x:e,y:t}}function p(e,t){return{x:e.x+t.x,y:e.y+t.y}}function m(e,t){return{x:e.x-t.x,y:e.y-t.y}}function ee(e,t){return{x:e.x*t,y:e.y*t}}var te={duration:.2,easing:e=>e},ne={stiffness:150,damping:18},re={speed:1},ie={amplitude:0,frequency:3,bias:0},h=class{value;velocity=0;baseValue=0;mode=`hold`;time=0;timeInMode=0;tweenStart=0;tweenTarget=0;tweenConfig=te;springTarget=0;springConfig=ne;followTarget=0;followConfig=re;swayEnabled=!1;swayConfig={...ie};lastSwayValue=0;swayFade=0;constructor(e=0){this.baseValue=e,this.value=this.baseValue}hold(){return this.mode=`hold`,this.timeInMode=0,this.velocity=0,this}tweenTo(e,t){return this.mode=`tween`,this.tweenConfig={...te,...t},this.tweenStart=this.value,this.tweenTarget=e,this.timeInMode=0,this}springTo(e,t){return this.mode=`spring`,this.springConfig={...ne,...t},this.springTarget=e,this.timeInMode=0,this}followTo(e,t){return this.mode=`follow`,this.followConfig={...re,...t},this.followTarget=e,this}swayTo(e){return this.swayConfig={...this.swayConfig,...e},this.swayEnabled=!0,this}disableSway(){return this.swayEnabled=!1,this}update(e){switch(this.time+=e,this.timeInMode+=e,this.mode){case`hold`:break;case`tween`:{let e=Math.min(this.timeInMode/this.tweenConfig.duration,1),t=this.tweenConfig.easing(e);this.baseValue=this.tweenStart+(this.tweenTarget-this.tweenStart)*t;break}case`spring`:{let{stiffness:t,damping:n}=this.springConfig,r=-t*(this.baseValue-this.springTarget)-n*this.velocity;this.velocity+=r*e,this.baseValue+=this.velocity*e;break}case`follow`:{let{speed:t}=this.followConfig,n=1-(1-t)**e;this.baseValue+=(this.followTarget-this.baseValue)*n;break}}if(this.swayEnabled&&this.swayConfig){this.swayFade=Math.min(this.swayFade+e*8,1);let t=(Math.sin(this.time*this.swayConfig.frequency+0)*this.swayConfig.amplitude+this.swayConfig.bias-this.lastSwayValue)*this.swayFade;this.baseValue+=t,this.lastSwayValue+=t}else this.swayFade=0;this.value=this.baseValue}},g=class e{r;g;b;a;constructor(e,t,n,r){this.r=e,this.g=t,this.b=n,this.a=r}static fromRgba255(t,n,r,i=255){return new e(t/255,n/255,r/255,i/255)}static fromHex(t){return e.fromRgba255((t&16711680)>>16,(t&65280)>>8,t&255,255)}static fromHexString(t){let n=t.startsWith(`#`)?t.slice(1):t;n=n.startsWith(`0x`)?n.slice(2):n,n.length===3&&(n=n.split(``).map(e=>e+e).join(``));let r=parseInt(n,16);return isNaN(r)?(console.error(`Invalid color hex string: ${t}`),null):n.length===6?e.fromRgba255(r>>16&255,r>>8&255,r&255,255):n.length===8?e.fromRgba255(r>>24&255,r>>16&255,r>>8&255,r&255):(console.error(`Unsupported hex string length: ${t}`),null)}static white=e.fromRgba255(255,255,255,255);static black=e.fromRgba255(0,0,0,255);static red=e.fromRgba255(255,0,0,255);static lerp(t,n,r){return r=Math.max(0,Math.min(1,r)),new e(t.r+(n.r-t.r)*r,t.g+(n.g-t.g)*r,t.b+(n.b-t.b)*r,t.a+(n.a-t.a)*r)}get rgb24(){let e=Math.round(this.r*255),t=Math.round(this.g*255),n=Math.round(this.b*255);return e<<16|t<<8|n}get rgbaNormalized(){return{r:this.r,g:this.g,b:this.b,a:this.a}}get rgba255(){return{r:Math.round(this.r*255),g:Math.round(this.g*255),b:Math.round(this.b*255),a:Math.round(this.a*255)}}};const _={black:`#000000`,darkblue:`#1D2B53`,darkred:`#7E2553`,darkgreen:`#008751`,brown:`#AB5236`,gray:`#5F574F`,lightgray:`#C2C3C7`,white:`#FFF1E8`,red:`#FF004D`,orange:`#FFA300`,yellow:`#FFEC27`,green:`#00E436`,blue:`#29ADFF`,purple:`#83769C`,pink:`#FF77A8`,sand:`#FFCCAA`},v={white:`#fbf8fd`,light:`#a1a9d1`,blue:`#007fff`,darkblue:`#24256f`,black:`#141218`,purple:`#5f0e52`,red:`#fd1a43`,pink:`#ffb16c`,yellow:`#fede5b`,green:`#74ead6`},y={};for(let e of Object.keys(_))y[e]=g.fromHexString(_[e]);const b={};for(let e of Object.keys(v))b[e]=g.fromHexString(v[e]);const x=e=>e>>3,S=e=>e&7,ae=(e,t)=>0<=e&&e<8&&0<=t&&t<8?e+8*t:void 0;var oe=e=>(e-=e>>>1&1431655765,e=(e&858993459)+(e>>>2&858993459),Math.imul(e+(e>>>4)&252645135,16843009)>>24),C=e=>(e=e>>>8&16711935|(e&16711935)<<8,e>>>16&65535|(e&65535)<<16),se=e=>(e=e>>>1&1431655765|(e&1431655765)<<1,e=e>>>2&858993459|(e&858993459)<<2,e=e>>>4&252645135|(e&252645135)<<4,C(e)),w=class e{lo;hi;constructor(e,t){this.lo=e|0,this.hi=t|0}static fromSquare(t){return t>=32?new e(0,1<<t-32):new e(1<<t,0)}static fromRank(t){return new e(255,0).shl64(8*t)}static fromFile(t){return new e(16843009<<t,16843009<<t)}static empty(){return new e(0,0)}static full(){return new e(4294967295,4294967295)}static corners(){return new e(129,2164260864)}static center(){return new e(402653184,24)}static backranks(){return new e(255,4278190080)}static backrank(t){return t===`white`?new e(255,0):new e(0,4278190080)}static lightSquares(){return new e(1437226410,1437226410)}static darkSquares(){return new e(2857740885,2857740885)}complement(){return new e(~this.lo,~this.hi)}xor(t){return new e(this.lo^t.lo,this.hi^t.hi)}union(t){return new e(this.lo|t.lo,this.hi|t.hi)}intersect(t){return new e(this.lo&t.lo,this.hi&t.hi)}diff(t){return new e(this.lo&~t.lo,this.hi&~t.hi)}intersects(e){return this.intersect(e).nonEmpty()}isDisjoint(e){return this.intersect(e).isEmpty()}supersetOf(e){return e.diff(this).isEmpty()}subsetOf(e){return this.diff(e).isEmpty()}shr64(t){return t>=64?e.empty():t>=32?new e(this.hi>>>t-32,0):t>0?new e(this.lo>>>t^this.hi<<32-t,this.hi>>>t):this}shl64(t){return t>=64?e.empty():t>=32?new e(0,this.lo<<t-32):t>0?new e(this.lo<<t,this.hi<<t^this.lo>>>32-t):this}bswap64(){return new e(C(this.hi),C(this.lo))}rbit64(){return new e(se(this.hi),se(this.lo))}minus64(t){let n=this.lo-t.lo,r=(n&t.lo&1)+(t.lo>>>1)+(n>>>1)>>>31;return new e(n,this.hi-(t.hi+r))}equals(e){return this.lo===e.lo&&this.hi===e.hi}size(){return oe(this.lo)+oe(this.hi)}isEmpty(){return this.lo===0&&this.hi===0}nonEmpty(){return this.lo!==0||this.hi!==0}has(e){return(e>=32?this.hi&1<<e-32:this.lo&1<<e)!=0}set(e,t){return t?this.with(e):this.without(e)}with(t){return t>=32?new e(this.lo,this.hi|1<<t-32):new e(this.lo|1<<t,this.hi)}without(t){return t>=32?new e(this.lo,this.hi&~(1<<t-32)):new e(this.lo&~(1<<t),this.hi)}toggle(t){return t>=32?new e(this.lo,this.hi^1<<t-32):new e(this.lo^1<<t,this.hi)}last(){if(this.hi!==0)return 63-Math.clz32(this.hi);if(this.lo!==0)return 31-Math.clz32(this.lo)}first(){if(this.lo!==0)return 31-Math.clz32(this.lo&-this.lo);if(this.hi!==0)return 63-Math.clz32(this.hi&-this.hi)}withoutFirst(){return this.lo===0?new e(0,this.hi&this.hi-1):new e(this.lo&this.lo-1,this.hi)}moreThanOne(){return this.hi!==0&&this.lo!==0||(this.lo&this.lo-1)!=0||(this.hi&this.hi-1)!=0}singleSquare(){return this.moreThanOne()?void 0:this.last()}*[Symbol.iterator](){let e=this.lo,t=this.hi;for(;e!==0;){let t=31-Math.clz32(e&-e);e^=1<<t,yield t}for(;t!==0;){let e=31-Math.clz32(t&-t);t^=1<<e,yield 32+e}}*reversed(){let e=this.lo,t=this.hi;for(;t!==0;){let e=31-Math.clz32(t);t^=1<<e,yield 32+e}for(;e!==0;){let t=31-Math.clz32(e);e^=1<<t,yield t}}},T=(e,t)=>{let n=w.empty();for(let r of t){let t=e+r;0<=t&&t<64&&Math.abs(S(e)-S(t))<=2&&(n=n.with(t))}return n},E=e=>{let t=[];for(let n=0;n<64;n++)t[n]=e(n);return t},ce=E(e=>T(e,[-9,-8,-7,-1,1,7,8,9])),le=E(e=>T(e,[-17,-15,-10,-6,6,10,15,17])),ue={white:E(e=>T(e,[7,9])),black:E(e=>T(e,[-7,-9]))};const de=e=>ce[e],fe=e=>le[e],pe=(e,t)=>ue[e][t];var me=E(e=>w.fromFile(S(e)).without(e)),he=E(e=>w.fromRank(x(e)).without(e)),ge=E(e=>{let t=new w(134480385,2151686160),n=8*(x(e)-S(e));return(n>=0?t.shl64(n):t.shr64(-n)).without(e)}),_e=E(e=>{let t=new w(270549120,16909320),n=8*(x(e)+S(e)-7);return(n>=0?t.shl64(n):t.shr64(-n)).without(e)}),D=(e,t,n)=>{let r=n.intersect(t),i=r.bswap64();return r=r.minus64(e),i=i.minus64(e.bswap64()),r.xor(i.bswap64()).intersect(t)},ve=(e,t)=>D(w.fromSquare(e),me[e],t),ye=(e,t)=>{let n=he[e],r=t.intersect(n),i=r.rbit64();return r=r.minus64(w.fromSquare(e)),i=i.minus64(w.fromSquare(63-e)),r.xor(i.rbit64()).intersect(n)};const O=(e,t)=>{let n=w.fromSquare(e);return D(n,ge[e],t).xor(D(n,_e[e],t))},k=(e,t)=>ve(e,t).xor(ye(e,t)),be=(e,t)=>O(e,t).xor(k(e,t)),xe=(e,t,n)=>{switch(e.role){case`pawn`:return pe(e.color,t);case`knight`:return fe(t);case`bishop`:return O(t,n);case`rook`:return k(t,n);case`queen`:return be(t,n);case`king`:return de(t)}};function A(e,t){let{x:n,y:r}=e,i=t.get(n),a=t.get(r);if(S(i)===S(a))return i<a?3:7;if(x(i)===x(a))return i<a?1:5;let o=S(i)-S(a),s=x(i)-x(a);if(Math.abs(o)===Math.abs(s))return o<0?s<0?2:8:s<0?4:6;if(o===2){if(s===1)return 11;if(s===-1)return 12}else if(o===-2){if(s===1)return 13;if(s===-1)return 14}else if(o===1){if(s===2)return 15;if(s===-2)return 16}else if(o===-1){if(s===2)return 17;if(s===-2)return 18}return 0}function j(e){let t=Se(e),n=[];for(let[r,i]of e.entries()){let a=xe(Ce(r),i,t);a=a.intersect(t);for(let t of a){let[i]=[...e.entries()].find(e=>e[1]===t);n.push({x:r,y:i})}}return n}function Se(e){let t=w.empty();for(let n of e.values())t=t.set(n,!0);return t}function Ce(e){switch(e[0]){case`P`:return{color:`white`,role:`pawn`};case`p`:return{color:`black`,role:`pawn`};case`b`:return{color:`black`,role:`bishop`};case`n`:return{color:`black`,role:`knight`};case`r`:return{color:`black`,role:`rook`};case`q`:return{color:`black`,role:`queen`};case`k`:return{color:`black`,role:`king`}}}function M(e){e=e.split(` `)[0];let t=new Map,n=0,r=0,i=0,a=0,o=0,s=0,c=0,l=e=>{switch(e){case`P`:return`P`+ ++n;case`p`:return`p`+ ++r;case`B`:case`b`:return`b`+ ++a;case`N`:case`n`:return`n`+ ++s;case`R`:case`r`:return`r`+ ++o;case`Q`:case`q`:return`q`+ ++c;case`K`:case`k`:return`k`+ ++i}},u=7;for(let n of e.split(`/`)){let e=0;for(let r of n){let n=l(r);if(n!==void 0){let r=ae(e,u);r!==void 0&&t.set(n,r),e+=1}else{e+=parseInt(r);continue}}--u}return t}var N=120,P=class e{static createEmptyGrid(){return Array(8).fill(null).map(()=>Array(8).fill(!1))}static checkerboard(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=(e+n)%2==0;return t}static fullGrid(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=!0;return t}static border(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=e===0||e===7||n===0||n===7;return t}static diagonal(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=e===n||e===7-n;return t}static cross(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=e===3||e===4||n===3||n===4;return t}static dots(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=e%2==0&&n%2==0;return t}static fromString(t){let n=e.createEmptyGrid(),r=t.trim().split(`
`);for(let e=0;e<8&&e<r.length;e++){let t=r[e].split(``);for(let r=0;r<8&&r<t.length;r++)n[e][r]=t[r]===`1`||t[r]===`X`}return n}static random(){let t=e.createEmptyGrid();for(let e=0;e<8;e++)for(let n=0;n<8;n++)t[e][n]=Math.random()>.5;return t}},F=class{static patternTransition(e,t,n=10){let r=[],i=e.length,a=e[0].length;for(let o=0;o<=n;o++){let s=o/n,c=P.createEmptyGrid();for(let n=0;n<i;n++)for(let r=0;r<a;r++){let i=e[n][r]?1:0,a=t[n][r]?1:0,o=i*(1-s)+a*s;c[n][r]=o>.5}r.push({grid:c,delay:N})}return r}static rowSweep(e,t=`top`){let n=[];for(let r=0;r<8;r++){let i=P.createEmptyGrid(),a=t===`top`?r:7-r;for(let n=0;n<8;n++)for(let r=0;r<8;r++)i[n][r]=e[n][r]&&(t===`top`&&n<=a||t===`bottom`&&n>=a);n.push({grid:i,delay:N})}return n}static columnSweep(e,t=`left`){let n=[];for(let r=0;r<8;r++){let i=P.createEmptyGrid(),a=t===`left`?r:7-r;for(let n=0;n<8;n++)for(let r=0;r<8;r++)i[n][r]=e[n][r]&&(t===`left`&&r<=a||t===`right`&&r>=a);n.push({grid:i,delay:N})}return n}static randomBlink(e,t=20){let n=[];for(let r=0;r<t;r++){let t=P.createEmptyGrid();for(let n=0;n<8;n++)for(let r=0;r<8;r++)t[n][r]=e[n][r]&&Math.random()>.3;n.push({grid:t,delay:N})}return n}static pulse(e,t=3){let n=[],r=e.length,i=e[0].length;for(let a=0;a<t;a++)for(let t=0;t<10;t++){let a=t/9,o=Math.sin(a*Math.PI),s=P.createEmptyGrid();for(let t=0;t<r;t++)for(let n=0;n<i;n++)s[t][n]=e[t][n]&&o>.5;n.push({grid:s,delay:N})}return n}static wave(e,t=`horizontal`){let n=[],r=e.length,i=e[0].length;for(let a=0;a<16;a++){let o=P.createEmptyGrid();for(let n=0;n<r;n++)for(let r=0;r<i;r++){let i=t===`horizontal`?n:r,s=(Math.sin((i+a*.5)*Math.PI/4)+1)*.5;o[n][r]=e[n][r]&&s>.5}n.push({grid:o,delay:N})}return n}};const I={empty:P.createEmptyGrid,checkerboard:P.checkerboard,full:P.fullGrid,border:P.border,diagonal:P.diagonal,cross:P.cross,dots:P.dots,random:P.random},L={rowsweep:e=>F.rowSweep(e,`top`),"rowsweep-reverse":e=>F.rowSweep(e,`bottom`),colsweep:e=>F.columnSweep(e,`left`),"colsweep-reverse":e=>F.columnSweep(e,`right`),blink:e=>F.randomBlink(e,20),pulse:e=>F.pulse(e,3),"wave-horizontal":e=>F.wave(e,`horizontal`),"wave-vertical":e=>F.wave(e,`vertical`)},we=e=>F.patternTransition(e,I.empty(),8),R=()=>{let e=Object.keys(L),t=L[e[Math.floor(Math.random()*e.length)]],n=Object.keys(I);return t(I[n[Math.floor(Math.random()*n.length)]]())};var z=t({_init:()=>Ee,_render:()=>Ne,_update:()=>De,hitbox_rect:()=>He,next_scene:()=>We}),B={xy:f(300,60),wh:f(960,960)};Ke(B);var V,H,U,W,G,K;function Te(e){let t=()=>Math.floor(Math.random()*64);W=[];let n=[];for(let r of e.keys()){let i=t();for(;n.includes(i);)i=t();n.length>=1&&(i=e.get(r)),n.push(i),W.push({pieces:r,xy:{x:new h(500),y:new h(500)},sq_base:i})}U=j(e),G=U.map(e=>({data:e,piece:W.find(t=>t.pieces===e.x),xy:{x:new h(0),y:new h(0)},stick:0})),K=[]}var q,J,Y={x:new h,y:new h,r:new h},X;function Ee(){X={frames:[],time:0},Te(M(`4k3/4b3/5pp1/3KP2p/1p5P/4B1P1/1P6/8 w - - 1 44`)),Te(M(`4rk2/3q1p2/2pp1Ppp/p1p5/2P2bN1/1P2Q3/P4PPP/4RK2 w - - 2 28`)),q=0,J=!1,H=0,V={xy:f(0,0),wh:{x:40,y:40},follow:{x:new h().swayTo({amplitude:-8,frequency:13,bias:0}),y:new h().swayTo({amplitude:-8,frequency:13,bias:0})}}}function De(e){Ae(e),H+=e/1e3,V.follow.x.followTo(l.is_hovering[0],{speed:.99999999}),V.follow.y.followTo(l.is_hovering[1],{speed:.99999999}),V.follow.x.update(e/1e3),V.follow.y.update(e/1e3),V.xy=f(V.follow.x.value,V.follow.y.value),V.drag&&l.has_moved_after_last_down&&(V.drag.piece.xy.x.followTo(V.xy.x-V.drag.decay.x),V.drag.piece.xy.y.followTo(V.xy.y-V.drag.decay.y)),V.sq=Je(V.xy);let t=!J&&q===0;if(t&&l.is_just_down){let e=V.sq;if(e!==void 0){let t=W.find(t=>t.sq===e);t&&(t.xy.x.springTo(t.xy.x.value-10,{stiffness:800,damping:10}),t.xy.y.springTo(t.xy.y.value-15,{stiffness:800,damping:10}),V.drag={decay:m(V.xy,{x:t.xy.x.value-10,y:t.xy.y.value-15}),piece:t},V.follow.x.swayEnabled=!1,V.follow.y.swayEnabled=!1)}}l.is_up&&(V.follow.x.swayEnabled=!0,V.follow.y.swayEnabled=!0);for(let t of W)je(t,e);for(let t of G)Me(t,G.filter(e=>e.stick===0).indexOf(t),e);for(let t of K)Me(t,0,e);if(l.is_up&&(V.drag&&=void 0,t)){let e=j(Ye());U.every(t=>e.some(e=>t.x===e.x&&t.y===e.y))&&e.every(e=>U.some(t=>e.x===t.x&&e.y===t.y))&&(q=2e3)}q>0&&(q-=e,q<=0&&(q=0,J=!0,Oe())),q>1500?(Y.x.springTo(10,{stiffness:1e3,damping:8}),Y.y.springTo(-35,{stiffness:1e3,damping:8}),Y.r.springTo(Math.PI*.5,{stiffness:1e3,damping:2})):q>800&&Y.y.springTo(-1e3,{stiffness:50}),Y.x.update(e/1e3),Y.y.update(e/1e3),Y.r.update(e/1e3),ke(e)}function Oe(){X.frames=[...R(),...R(),...R(),...we(I.full())]}function ke(e){let t=X.frames.shift();t&&(X.time+=e,X.time>t.delay?X.time-=t.delay:X.frames.unshift(t))}function Ae(e){let t=Ye(),n=j(t),r=G;r.forEach(e=>e.stick=0);for(let e of n){let n=r.find(t=>t.data.x===e.x&&t.data.y===e.y);n&&(n.stick=A(e,t))}let i=n.filter(e=>!U.find(t=>t.x===e.x&&t.y===e.y)),a=K;for(let e of i){let n=a.find(t=>t.data.x===e.x&&t.data.y===e.y),r=A(e,t);n&&(n.stick=r),n||a.push({data:e,piece:W.find(t=>t.pieces===e.x),xy:{x:new h(0),y:new h(0)},stick:A(e,t)})}let o=a.filter(e=>!i.find(t=>t.x===e.data.x&&t.y===e.data.y));K=a.filter(e=>!o.includes(e))}function je(e,t){e.sq=Je(f(e.xy.x.value,e.xy.y.value));let n=qe(e.sq_base);V.drag?.piece===e?l.is_up&&e.sq!==void 0&&(e.sq_base=e.sq):(e.xy.x.springTo(n.x,{stiffness:600,damping:17}),e.xy.y.springTo(n.y,{stiffness:600,damping:17})),e.xy.x.update(t/1e3),e.xy.y.update(t/1e3)}function Me(e,t,n){if(e.stick===0){let n=Math.sin(H*.5*Math.PI*2+t*Math.PI*.25)*80,r=Math.cos(H*.5*Math.PI*2+t*Math.PI*.25)*80;e.xy.x.followTo(r,{speed:.999}),e.xy.y.followTo(n,{speed:.999})}else{let[t,n]=Ge[e.stick];e.xy.x.springTo(t*37),e.xy.y.springTo(n*37)}e.xy.x.update(n/1e3),e.xy.y.update(n/1e3)}function Ne(){u.beginFrame(),u.fillRect(1920/2,1080/2,1920,1080,y.darkblue),Be();for(let e of W)Pe(e);Ve(V.xy.x,V.xy.y),u.endFrame()}function Pe(e){let t=e.xy.x.value,n=e.xy.y.value;ze(t,n,e.pieces);for(let e=0;e<G.length;e++){let t=G[e],n=t.piece.xy.x.value,r=t.piece.xy.y.value;n+=t.xy.x.value,r+=t.xy.y.value,n+=Y.x.value*(e%2==0?-20:20),r+=Y.y.value;let i=Y.r.value*(e%2==0?-1:1);Ie(n,r,t.data.y,t.stick,i)}for(let e of K){let t=e.piece.xy.x.value,n=e.piece.xy.y.value;t+=e.xy.x.value,n+=e.xy.y.value,Fe(t,n,e.data.y,e.stick)}}function Fe(e,t,n,r){let i=y.red;u.fillRoundRect(e,t,46,46,6,y.darkblue),u.strokeRoundRect(e,t,46,46,6,1,i),Re(e,t,n)}function Ie(e,t,n,r,i){let a=r===0?y.red:y.green;u.fillRoundRect(e,t,46,46,6,y.darkblue,i),u.strokeRoundRect(e,t,46,46,6,1,a,void 0,i),Re(e,t,n)}var Le=[b.yellow,b.white,b.blue,b.pink,b.green,b.light,b.black,b.purple,b.darkblue];function Re(e,t,n){let r=Le[parseInt(n[1])-1];n[0]===`r`&&(u.strokeLine(e-10,t,e+10,t,4,r),u.strokeLine(e,t-10,e,t+10,4,r)),n[0]===`b`&&(u.strokeLine(e-8,t-8,e+8,t+8,4,r),u.strokeLine(e-8,t+8,e+8,t-8,4,r)),n[0]===`P`&&(u.strokeLine(e-8,t-8,e,t,4,r),u.strokeLine(e+8,t-8,e,t,4,r),u.strokeLine(e,t,e,t+4,4,r)),n[0]===`p`&&(u.strokeLine(e-8,t+8,e,t,4,r),u.strokeLine(e+8,t+8,e,t,4,r),u.strokeLine(e,t,e,t-4,4,r)),n[0]===`k`&&u.strokeRoundRect(e,t,20,20,4,4,r),n[0]===`n`&&(u.strokeLine(e-4,t-8,e-4,t+8,4,r),u.strokeLine(e-4,t+8,e+4,t+8,4,r)),n[0]===`q`&&(u.strokeLine(e-10,t,e+10,t,4,r),u.strokeLine(e,t-10,e,t+10,4,r),u.strokeLine(e-8,t-8,e+8,t+8,4,r),u.strokeLine(e-8,t+8,e+8,t-8,4,r))}function ze(e,t,n){let r=Le[parseInt(n[1])-1];n[0]===`b`&&(u.strokeLine(e-20,t-20,e+20,t+20,9,r),u.strokeLine(e-20,t+20,e+20,t-20,9,r)),n[0]===`r`&&(u.strokeLine(e-25,t,e+25,t,9,r),u.strokeLine(e,t-25,e,t+25,9,r)),n[0]===`P`&&(u.strokeLine(e-20,t-20,e,t,9,r),u.strokeLine(e+20,t-20,e,t,9,r),u.strokeLine(e,t,e,t+10,9,r)),n[0]===`p`&&(u.strokeLine(e-20,t+20,e,t,9,r),u.strokeLine(e+20,t+20,e,t,9,r),u.strokeLine(e,t,e,t-10,9,r)),n[0]===`k`&&u.strokeRoundRect(e,t,64,64,10,9,r),n[0]===`n`&&(u.strokeLine(e-10,t-20,e-10,t+20,9,r),u.strokeLine(e-10,t+20,e+10,t+20,9,r)),n[0]===`q`&&(u.strokeLine(e-20,t-20,e+20,t+20,9,r),u.strokeLine(e-20,t+20,e+20,t-20,9,r),u.strokeLine(e-22,t,e+22,t,9,r),u.strokeLine(e,t-22,e,t+22,9,r))}function Be(){let e,t;e=300,t=60;for(let n=0;n<8;n++)for(let r=0;r<8;r++)X.frames[0]?.grid[n][r]&&((n+r)%2==0?u.fillRoundRect(e+n*120+120/2,t+r*120+120/2,136,136,16,y.pink):u.fillRoundRect(e+n*120+120/2,t+r*120+120/2,152,152,16,y.blue)),(n+r)%2==0?u.strokeRoundRect(e+n*120+120/2,t+r*120+120/2,136,136,16,3,y.pink):u.strokeRoundRect(e+n*120+120/2,t+r*120+120/2,152,152,16,3,y.blue)}function Ve(e,t){u.strokeLine(e+40,t+3,e,t,16,y.black),u.strokeLine(e,t,e+3,t+40,16,y.black)}function He(e){let t=e.xy.x,n=e.xy.y,r=e.wh.x,i=e.wh.y;u.strokeRect(t+r/2,n+i/2,r,i,7,y.red)}var Ue=void 0;function We(){let e=Ue;if(e!==void 0)return Ue=void 0,e}var Ge=[[0,0],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[0,0],[0,0],[-1,.6],[-1,-.6],[1,.6],[1,-.6],[-.6,1],[-.6,-1],[.6,1],[.6,-1]];function Ke(e){let t=[];for(let n=0;n<8;n++){let r=[];for(let t=0;t<8;t++)r.push({xy:f(e.xy.x+n*120,e.xy.y+t*120),wh:f(120,120)});t.push(r)}return t}function qe(e){let t=S(e),n=7-x(e);return p(p(f(t/8*B.wh.x,n/8*B.wh.y),B.xy),ee(B.wh,1/16))}function Je(e){let t=m(e,B.xy),n=B.wh.x,r=Math.floor(t.x/n*8),i=Math.floor(t.y/n*8);if(!(r<0||r>7||i<0||i>7))return ae(r,7-i)}function Ye(){let e=new Map;for(let t of W)t.sq!==void 0&&e.set(t.pieces,t.sq);return e}var Xe={_init(){},_update(e){},_render(){},next_scene(){}},Z,Q;function $(e){Q._destroy?.(),Q=e}var Ze={simulate:z};function Qe(){Z=Xe,Q=Z,$(z)}function $e(e){Q!==Z&&(Z=Q,Z._init()),Z._update(e);let t=Z.next_scene();t!==void 0&&$(Ze[t]),l.update(e)}function et(){Z._render()}function tt(){Z._after_render?.()}async function nt(e){let t=d(),r=document.createElement(`div`);t.classList.add(`interactive`),r.classList.add(`content`),r.appendChild(t),e.appendChild(r),Qe(),n($e,et,tt)}nt(document.getElementById(`app`));