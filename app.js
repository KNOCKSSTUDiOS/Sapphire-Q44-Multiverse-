// Sapphire Multiverse — Q44 Studio
// Multi-scene WebGL 360 pano renderer runs in CENTER canvas (panoCanvas)

const $ = (id) => document.getElementById(id);

const sceneListEl = $("sceneList");
const sceneReadoutEl = $("sceneReadout");
const gyroReadoutEl = $("gyroReadout");
const logEl = $("log");

const canvas = $("panoCanvas");
const stage = $("viewportStage");

const btnPrevScene = $("btnPrevScene");
const btnNextScene = $("btnNextScene");
const btnAddScene = $("btnAddScene");
const sceneFile = $("sceneFile");

const btnGyro = $("btnGyro");
const btnCenter = $("btnCenter");

const btnPlay = $("btnPlay");
const btnPause = $("btnPause");
const btnStop = $("btnStop");
const timeline = $("timeline");
const timeReadout = $("timeReadout");

const yawSlider = $("yaw");
const pitchSlider = $("pitch");
const zoomSlider = $("zoom");
const fadeSlider = $("fadeMs");

const yawVal = $("yawVal");
const pitchVal = $("pitchVal");
const zoomVal = $("zoomVal");
const fadeVal = $("fadeVal");

const contrast = $("contrast");
const sat = $("sat");
const hue = $("hue");
const contrastVal = $("contrastVal");
const satVal = $("satVal");
const hueVal = $("hueVal");

const cmdbar = $("cmdbar");
const cmdBackdrop = $("cmdBackdrop");
const cmdInput = $("cmdInput");

const loopSteps = Array.from(document.querySelectorAll(".loop-step"));

/* -------------------------
   Logging (HUD / left panel)
------------------------- */
function escapeHTML(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function log(tag, text){
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<span class="mono micro dim">[${escapeHTML(tag)}]</span> <span class="mono micro">${escapeHTML(text)}</span>`;
  logEl.prepend(item);
}

/* -------------------------
   Core State
------------------------- */
const state = {
  // multi-panorama scenes
  scenes: [
    { id: "teal_sky", name: "Sapphire — Quantum Teal Sky (Demo)", kind: "procedural", source: "teal_sky" },
    { id: "neon_grid", name: "Sapphire — Neon Grid (Demo)", kind: "procedural", source: "neon_grid" },
    { id: "studio_loft", name: "Sapphire — Studio Loft (Demo)", kind: "procedural", source: "studio_loft" },
  ],
  activeScene: 0,

  // camera orientation (deg)
  targetYaw: 0,
  targetPitch: 0,
  yaw: 0,
  pitch: 0,

  // zoom -> FOV
  zoom: 1.0,

  // transition
  fadeMs: 900,
  transitioning: false,
  transitionStart: 0,
  transitionMix: 0,

  // gyro
  gyroEnabled: false,
  lastAlpha: null,
  alphaAccum: 0,

  // drag
  dragging: false,
  lastX: 0,
  lastY: 0,

  // timeline
  playing: false,
  frame: 0,
  maxFrame: 120,
  fps: 24
};

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function wrap180(a){
  let x = ((a + 180) % 360 + 360) % 360 - 180;
  return x;
}
function degToRad(d){ return d * Math.PI / 180; }
function nowMs(){ return performance && performance.now ? performance.now() : Date.now(); }

/* -------------------------
   Apply Grade (CSS vars)
------------------------- */
function applyGrade(){
  document.documentElement.style.setProperty("--contrast", contrast.value);
  document.documentElement.style.setProperty("--saturate", sat.value);
  document.documentElement.style.setProperty("--hue", `${hue.value}deg`);
}
function syncGradeLabels(){
  contrastVal.textContent = Number(contrast.value).toFixed(2);
  satVal.textContent = Number(sat.value).toFixed(2);
  hueVal.textContent = String(hue.value);
}
["input","change"].forEach(evt => {
  contrast.addEventListener(evt, () => { applyGrade(); syncGradeLabels(); });
  sat.addEventListener(evt, () => { applyGrade(); syncGradeLabels(); });
  hue.addEventListener(evt, () => { applyGrade(); syncGradeLabels(); });
});
applyGrade();
syncGradeLabels();

/* -------------------------
   UI Sync
------------------------- */
function syncCameraLabels(){
  yawVal.textContent = String(Math.round(state.targetYaw));
  pitchVal.textContent = String(Math.round(state.targetPitch));
  zoomVal.textContent = state.zoom.toFixed(2);
  fadeVal.textContent = String(state.fadeMs);
}
function updateSceneReadout(){
  const s = state.scenes[state.activeScene];
  sceneReadoutEl.textContent = `Scene: ${s ? s.name : "—"}`;
}
function fmtTime(sec){
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function updateTimeReadout(){
  const total = state.maxFrame / state.fps;
  const cur = state.frame / state.fps;
  timeReadout.textContent = `${fmtTime(cur)} / ${fmtTime(total)}`;
}

/* -------------------------
   Scenes UI
------------------------- */
function renderScenes(){
  sceneListEl.innerHTML = "";
  state.scenes.forEach((s, idx) => {
    const el = document.createElement("div");
    el.className = "scene" + (idx === state.activeScene ? " active" : "");
    el.innerHTML = `
      <div class="mono micro teal">${escapeHTML(s.id)}</div>
      <div class="impact name">${escapeHTML(s.name)}</div>
      <div class="mono meta">${escapeHTML(s.kind)} • click to switch</div>
    `;
    el.addEventListener("click", () => switchToSceneIndex(idx));
    sceneListEl.appendChild(el);
  });
}

function switchToSceneIndex(idx){
  const target = (idx + state.scenes.length) % state.scenes.length;
  if (target === state.activeScene && !state.transitioning) return;

  // load next into texB, fade to it
  loadSceneIntoTextureB(target);

  state.transitioning = true;
  state.transitionStart = nowMs();
  state.transitionMix = (state.fadeMs <= 0) ? 1 : 0;

  state.activeScene = target;
  updateSceneReadout();
  renderScenes();

  log("SCENE", `Switched to: ${state.scenes[state.activeScene].id}`);
}

btnPrevScene.addEventListener("click", () => switchToSceneIndex(state.activeScene - 1));
btnNextScene.addEventListener("click", () => switchToSceneIndex(state.activeScene + 1));

btnAddScene.addEventListener("click", () => {
  sceneFile.value = "";
  sceneFile.click();
});

sceneFile.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  addSceneFromFile(file);
});

/* -------------------------
   Sliders -> state
------------------------- */
yawSlider.addEventListener("input", () => {
  state.targetYaw = Number(yawSlider.value);
  syncCameraLabels();
});
pitchSlider.addEventListener("input", () => {
  state.targetPitch = Number(pitchSlider.value);
  syncCameraLabels();
});
zoomSlider.addEventListener("input", () => {
  state.zoom = Number(zoomSlider.value);
  syncCameraLabels();
});
fadeSlider.addEventListener("input", () => {
  state.fadeMs = Number(fadeSlider.value);
  syncCameraLabels();
});

/* -------------------------
   Timeline / transport
------------------------- */
timeline.addEventListener("input", () => {
  state.frame = Number(timeline.value);
  updateTimeReadout();
});
btnPlay.addEventListener("click", () => { state.playing = true; log("PLAY", "Playback started"); });
btnPause.addEventListener("click", () => { state.playing = false; log("PAUSE", "Playback paused"); });
btnStop.addEventListener("click", () => {
  state.playing = false;
  state.frame = 0;
  timeline.value = 0;
  updateTimeReadout();
  log("STOP", "Playback stopped");
});

/* -------------------------
   Center camera
------------------------- */
btnCenter.addEventListener("click", () => {
  state.targetYaw = 0;
  state.targetPitch = 0;
  state.yaw = 0;
  state.pitch = 0;
  state.lastAlpha = null;
  state.alphaAccum = 0;

  yawSlider.value = 0;
  pitchSlider.value = 0;
  syncCameraLabels();
  log("CAM", "Centered view");
});

/* -------------------------
   Drag look-around
------------------------- */
stage.addEventListener("pointerdown", (e) => {
  state.dragging = true;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
});
stage.addEventListener("pointermove", (e) => {
  if (!state.dragging) return;
  const dx = e.clientX - state.lastX;
  const dy = e.clientY - state.lastY;
  state.lastX = e.clientX;
  state.lastY = e.clientY;

  state.targetYaw = clamp(state.targetYaw + dx * 0.25, -180, 180);
  state.targetPitch = clamp(state.targetPitch + dy * 0.18, -75, 75);

  yawSlider.value = state.targetYaw;
  pitchSlider.value = state.targetPitch;
  syncCameraLabels();
});
["pointerup","pointercancel","pointerleave"].forEach(evt =>
  stage.addEventListener(evt, () => state.dragging = false)
);

/* -------------------------
   Gyro (permission on some platforms)
------------------------- */
async function enableGyro(){
  try{
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") return false;
    }
    if (!state.gyroEnabled){
      window.addEventListener("deviceorientation", onOrientation, { passive:true });
      state.gyroEnabled = true;
    }
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}

function onOrientation(e){
  const a = (e.alpha ?? 0);
  const b = (e.beta ?? 0);
  const g = (e.gamma ?? 0);
  gyroReadoutEl.textContent = `α: ${a.toFixed(0)}  β: ${b.toFixed(0)}  γ: ${g.toFixed(0)}`;

  if (state.lastAlpha === null){
    state.lastAlpha = a;
    state.alphaAccum = a;
  } else {
    let delta = a - state.lastAlpha;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    state.alphaAccum += delta;
    state.lastAlpha = a;
  }

  state.targetYaw = wrap180(-state.alphaAccum);
  state.targetPitch = clamp(-(b - 10), -75, 75);

  yawSlider.value = state.targetYaw;
  pitchSlider.value = state.targetPitch;
  syncCameraLabels();
}

btnGyro.addEventListener("click", async () => {
  const ok = await enableGyro();
  log("SENSOR", ok ? "Gyro enabled" : "Gyro denied");
});

/* -------------------------
   Command bar
------------------------- */
function openCmd(){
  cmdBackdrop.hidden = false;
  cmdbar.hidden = false;
  cmdInput.value = "";
  cmdInput.focus();
}
function closeCmd(){
  cmdBackdrop.hidden = true;
  cmdbar.hidden = true;
}

document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const mod = isMac ? e.metaKey : e.ctrlKey;

  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openCmd();
  }
  if (e.key === "Escape") closeCmd();
});

cmdBackdrop.addEventListener("click", closeCmd);

cmdInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const cmd = cmdInput.value.trim().toLowerCase();
  if (!cmd) return;

  if (cmd.includes("next")) switchToSceneIndex(state.activeScene + 1);
  else if (cmd.includes("prev")) switchToSceneIndex(state.activeScene - 1);
  else if (cmd.includes("center")) btnCenter.click();
  else if (cmd.includes("gyro")) btnGyro.click();
  else if (cmd.includes("export")) $("btnDownloadJSON").click();
  else log("CMD", `Unknown: ${cmd}`);

  closeCmd();
});

/* Consciousness loop animation */
let loopIndex = 0;
setInterval(() => {
  loopSteps.forEach(s => s.classList.remove("active"));
  loopSteps[loopIndex].classList.add("active");
  loopIndex = (loopIndex + 1) % loopSteps.length;
}, 1500);

/* -------------------------
   Export JSON snapshot
------------------------- */
$("btnDownloadJSON").addEventListener("click", () => {
  const s = state.scenes[state.activeScene];
  const payload = {
    engine: "Sapphire Multiverse",
    kernel: "Q44",
    role: "OWNER (UI)",
    scene: { id: s.id, name: s.name, kind: s.kind },
    camera: { yaw: state.targetYaw, pitch: state.targetPitch, zoom: state.zoom, fadeMs: state.fadeMs },
    grade: { contrast: Number(contrast.value), saturate: Number(sat.value), hue: Number(hue.value) },
    timeline: { frame: state.frame, maxFrame: state.maxFrame, fps: state.fps }
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sapphire-multiverse-project.json";
  a.click();
  URL.revokeObjectURL(url);

  log("EXPORT", "Downloaded project JSON");
});

$("btnExport").addEventListener("click", () => {
  // UI-only; real export gate is server-side later per your policy.
  log("EXPORT", "Export requested (UI). Server gate comes later.");
});

/* =========================================================
   WEBGL MULTI-SCENE EQUIRECTANGULAR PANORAMA RENDERER
   - two textures: A + B
   - mix crossfade between them
   - yaw/pitch controls direction
   - zoom controls FOV
========================================================= */

let gl = null;
let program = null;
let quadVbo = null;

let a_pos = null;
let u_texA = null;
let u_texB = null;
let u_mix = null;
let u_rot = null;
let u_tanHalfFov = null;
let u_aspect = null;

let texA = null;
let texB = null;
let webglOK = false;

function createGL(canvasEl){
  return canvasEl.getContext("webgl", { antialias: true, alpha: false, premultipliedAlpha: false }) ||
         canvasEl.getContext("experimental-webgl");
}

function compileShader(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log || "Shader compile failed");
  }
  return sh;
}

function createProgram(gl, vsSrc, fsSrc){
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const pr = gl.createProgram();
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(pr);
    gl.deleteProgram(pr);
    throw new Error(log || "Program link failed");
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return pr;
}

function makeTexture(gl){
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

function updateTextureFromImage(gl, tex, img){
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function resizeCanvasToDisplaySize(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  const w = Math.floor(rect.width * dpr);
  const h = Math.floor(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resizeCanvasToDisplaySize);

/* Procedural demo panoramas (2:1 equirectangular canvas) */
function createPanoCanvas(width=2048, height=1024){
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

function pano_teal_sky(){
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#02020a");
  g.addColorStop(0.45, "#050516");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  for (let i=0;i<7;i++){
    const y = Math.floor((h * (i+0.5)) / 7);
    const band = ctx.createLinearGradient(0, y-120, 0, y+120);
    band.addColorStop(0, "rgba(0,180,216,0)");
    band.addColorStop(0.5, "rgba(0,180,216,0.12)");
    band.addColorStop(1, "rgba(0,180,216,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, y-120, w, 240);
  }

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i=0;i<1800;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = Math.random() < 0.985 ? Math.random()*1.1 : Math.random()*2.4;
    ctx.globalAlpha = 0.35 + Math.random()*0.65;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  ctx.lineTo(w, h/2);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,180,216,0.90)";
  ctx.font = "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Quantum Teal Sky", w/2, 90);

  return c;
}

function pano_neon_grid(){
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;

  const bg = ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0, "#070010");
  bg.addColorStop(0.6, "#02000a");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,w,h);

  ctx.globalAlpha = 0.9;
  for (let y=0; y<h; y+=32){
    ctx.strokeStyle = `rgba(123,44,191,${y < h/2 ? 0.10 : 0.04})`;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  for (let x=0; x<w; x+=48){
    ctx.strokeStyle = `rgba(0,180,216,0.06)`;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const hz = ctx.createLinearGradient(0, h/2 - 120, 0, h/2 + 120);
  hz.addColorStop(0, "rgba(255,136,0,0)");
  hz.addColorStop(0.5, "rgba(255,136,0,0.10)");
  hz.addColorStop(1, "rgba(255,136,0,0)");
  ctx.fillStyle = hz;
  ctx.fillRect(0, h/2 - 120, w, 240);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i=0;i<900;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = Math.random()*1.4;
    ctx.globalAlpha = 0.15 + Math.random()*0.45;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(123,44,191,0.90)";
  ctx.font = "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Neon Grid", w/2, 90);

  return c;
}

function pano_studio_loft(){
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;

  const bg = ctx.createLinearGradient(0,0,w,h);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#050510");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,w,h);

  const win = ctx.createRadialGradient(w*0.75, h*0.35, 20, w*0.75, h*0.35, 520);
  win.addColorStop(0, "rgba(255,255,255,0.18)");
  win.addColorStop(0.5, "rgba(0,180,216,0.08)");
  win.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = win;
  ctx.fillRect(0,0,w,h);

  for (let i=0;i<14;i++){
    const y = (h*i)/14;
    ctx.fillStyle = `rgba(255,255,255,${i%2===0 ? 0.015 : 0.008})`;
    ctx.fillRect(0, y, w, h/14);
  }

  const vg = ctx.createRadialGradient(w/2, h/2, 120, w/2, h/2, 900);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(0.65, "rgba(0,0,0,0.25)");
  vg.addColorStop(1, "rgba(0,0,0,0.70)");
  ctx.fillStyle = vg;
  ctx.fillRect(0,0,w,h);

  ctx.fillStyle = "rgba(0,180,216,0.85)";
  ctx.font = "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Studio Loft", w/2, 90);

  return c;
}

function buildProceduralByKey(key){
  if (key === "teal_sky") return pano_teal_sky();
  if (key === "neon_grid") return pano_neon_grid();
  if (key === "studio_loft") return pano_studio_loft();
  return pano_teal_sky();
}

/* Shader sources */
const vsSource = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = (a_pos * 0.5) + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const fsSource = `
precision mediump float;
varying vec2 v_uv;

uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform float u_mix;

uniform mat3 u_rot;
uniform float u_tanHalfFov;
uniform float u_aspect;

const float PI = 3.14159265358979323846264;

vec2 dirToEquirectUV(vec3 d) {
  d = normalize(d);
  float lon = atan(d.z, d.x);
  float lat = asin(clamp(d.y, -1.0, 1.0));
  float u = (lon / (2.0 * PI)) + 0.5;
  float v = 0.5 - (lat / PI);
  return vec2(fract(u), clamp(v, 0.0, 1.0));
}

void main() {
  vec2 ndc = (v_uv * 2.0) - 1.0;
  float x = ndc.x * u_aspect * u_tanHalfFov;
  float y = ndc.y * u_tanHalfFov;

  vec3 dirCam = normalize(vec3(x, -y, 1.0));
  vec3 dirWorld = u_rot * dirCam;

  vec2 uv = dirToEquirectUV(dirWorld);

  vec4 a = texture2D(u_texA, uv);
  vec4 b = texture2D(u_texB, uv);

  gl_FragColor = mix(a, b, clamp(u_mix, 0.0, 1.0));
}
`;

function computeRotationMatrix(yawDeg, pitchDeg){
  const yaw = degToRad(yawDeg);
  const pitch = degToRad(pitchDeg);

  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cx = Math.cos(pitch), sx = Math.sin(pitch);

  return new Float32Array([
    cy,   sy*sx,  sy*cx,
    0.0,  cx,    -sx,
    -sy,  cy*sx,  cy*cx
  ]);
}

function initWebGL(){
  gl = createGL(canvas);
  if (!gl){
    log("WEBGL", "WebGL unavailable on this browser");
    return;
  }

  program = createProgram(gl, vsSource, fsSource);
  webglOK = true;

  a_pos = gl.getAttribLocation(program, "a_pos");
  u_texA = gl.getUniformLocation(program, "u_texA");
  u_texB = gl.getUniformLocation(program, "u_texB");
  u_mix  = gl.getUniformLocation(program, "u_mix");
  u_rot = gl.getUniformLocation(program, "u_rot");
  u_tanHalfFov = gl.getUniformLocation(program, "u_tanHalfFov");
  u_aspect = gl.getUniformLocation(program, "u_aspect");

  quadVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,   1, -1,  -1,  1,
    -1,  1,   1, -1,   1,  1
  ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  texA = makeTexture(gl);
  texB = makeTexture(gl);

  const initial = getSceneImage(0);
  updateTextureFromImage(gl, texA, initial);
  updateTextureFromImage(gl, texB, initial);

  resizeCanvasToDisplaySize();
  log("WEBGL", "Renderer initialized");
}

function getSceneImage(index){
  const s = state.scenes[index];
  if (!s) return pano_teal_sky();
  if (s.kind === "procedural") return buildProceduralByKey(s.source);
  if (s.kind === "file" && s.image) return s.image;
  return pano_teal_sky();
}

// load into texB for crossfade
function loadSceneIntoTextureB(targetIndex){
  if (!webglOK) return;
  const img = getSceneImage(targetIndex);
  updateTextureFromImage(gl, texB, img);
}

// if no transition, keep A==B (optional)
function ensureTextureAIsCurrent(){
  if (!webglOK) return;
  const img = getSceneImage(state.activeScene);
  updateTextureFromImage(gl, texA, img);
  updateTextureFromImage(gl, texB, img);
}

function updateTransition(){
  if (!state.transitioning) return;

  if (state.fadeMs <= 0){
    state.transitionMix = 1;
  } else {
    const t = (nowMs() - state.transitionStart) / state.fadeMs;
    const tt = clamp(t, 0, 1);
    state.transitionMix = tt * tt * (3 - 2 * tt); // smoothstep
  }

  if (state.transitionMix >= 0.999){
    // promote B -> A by swapping handles
    const tmp = texA;
    texA = texB;
    texB = tmp;

    state.transitionMix = 0;
    state.transitioning = false;
  }
}

function renderWebGL(){
  if (!webglOK) return;

  resizeCanvasToDisplaySize();
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
  gl.enableVertexAttribArray(a_pos);
  gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texA);
  gl.uniform1i(u_texA, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texB);
  gl.uniform1i(u_texB, 1);

  gl.uniform1f(u_mix, state.transitionMix);

  const rot = computeRotationMatrix(state.yaw, state.pitch);
  gl.uniformMatrix3fv(u_rot, false, rot);

  const baseFov = 75;
  const fov = clamp(baseFov / state.zoom, 35, 95);
  const tanHalf = Math.tan(degToRad(fov) * 0.5);
  gl.uniform1f(u_tanHalfFov, tanHalf);

  const aspect = canvas.width / Math.max(1, canvas.height);
  gl.uniform1f(u_aspect, aspect);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/* -------------------------
   Add scene from file (local)
------------------------- */
function addSceneFromFile(file){
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const id = `file_${Date.now()}`;
    state.scenes.push({ id, name: file.name, kind: "file", image: img });
    renderScenes();
    switchToSceneIndex(state.scenes.length - 1);
    URL.revokeObjectURL(url);
    log("SCENE", `Added file scene: ${file.name}`);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    log("SCENE", "Failed to load image");
  };
  img.src = url;
}

/* -------------------------
   Mode chips (visual only)
------------------------- */
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    log("MODE", `Set mode: ${btn.dataset.mode}`);
  });
});

/* Primitives (UI only) */
document.querySelectorAll(".oring").forEach(btn => {
  btn.addEventListener("click", () => log("PRIM", `Opened primitive: ${btn.dataset.prim}`));
});

/* -------------------------
   Main loop
------------------------- */
function tick(){
  if (state.playing){
    state.frame = (state.frame + 1) % (state.maxFrame + 1);
    timeline.value = state.frame;
    updateTimeReadout();
  }

  // smooth camera easing
  const ease = 0.08;
  state.yaw += (state.targetYaw - state.yaw) * ease;
  state.pitch += (state.targetPitch - state.pitch) * ease;

  // update transition
  updateTransition();

  // render
  renderWebGL();

  requestAnimationFrame(tick);
}

/* -------------------------
   Init
------------------------- */
(function init(){
  log("BOOT", "Sapphire Multiverse online.");
  log("UI", "Studio portal loaded.");
  log("Q44", "Privileges shown are UI-only; server export gate later.");

  // defaults
  state.targetYaw = 0;
  state.targetPitch = 0;
  state.zoom = Number(zoomSlider.value);
  state.fadeMs = Number(fadeSlider.value);

  syncCameraLabels();
  updateTimeReadout();
  updateSceneReadout();
  renderScenes();

  initWebGL();
  ensureTextureAIsCurrent();

  tick();
})();

