// Sapphire Multiverse — Q44 Studio
// HYPER-CINEMA PANO ENGINE v1
// KNOCKSTUDiOS WORLD • CEO MODE

const $ = (id) => document.getElementById(id);

/* DOM HOOKS */
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
const btnExport = $("btnExport");

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

/* LOGGING */
function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function log(tag, text) {
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<span class="mono micro dim">[${escapeHTML(
    tag
  )}]</span> <span class="mono micro">${escapeHTML(text)}</span>`;
  logEl.prepend(item);
}

/* ANYLYTICS (HOOKS ONLY, READY FOR WORKERS) */
function track(event, data = {}) {
  console.debug("[ANYLYTICS]", event, data);
}

/* CORE STATE */
const state = {
  scenes: [
    {
      id: "teal_sky",
      name: "Sapphire — Quantum Teal Sky (Demo)",
      kind: "procedural",
      source: "teal_sky",
    },
    {
      id: "neon_grid",
      name: "Sapphire — Neon Grid (Demo)",
      kind: "procedural",
      source: "neon_grid",
    },
    {
      id: "studio_loft",
      name: "Sapphire — Studio Loft (Demo)",
      kind: "procedural",
      source: "studio_loft",
    },
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
  transitionMix: 0,
  transitioning: false,
  transitionStart: 0,
  transitionFromTexA: true,

  // playback
  playing: true,
  frame: 0,
  maxFrame: 120, // matches timeline max

  // gyro
  gyroEnabled: false,
  gyroAlpha: 0,
  gyroBeta: 0,
  gyroGamma: 0,

  // grade
  contrast: 1.1,
  saturate: 1.15,
  hue: 0,
};

/* MATH HELPERS */
function degToRad(d) {
  return (d * Math.PI) / 180;
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/* PANO CANVAS BUILDERS */
function createPanoCanvas(width = 2048, height = 1024) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

function pano_teal_sky() {
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width,
    h = c.height;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#02020a");
  g.addColorStop(0.45, "#050516");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 7; i++) {
    const y = Math.floor((h * (i + 0.5)) / 7);
    const band = ctx.createLinearGradient(0, y - 120, 0, y + 120);
    band.addColorStop(0, "rgba(0,180,216,0)");
    band.addColorStop(0.5, "rgba(0,180,216,0.12)");
    band.addColorStop(1, "rgba(0,180,216,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, y - 120, w, 240);
  }

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r =
      Math.random() < 0.985 ? Math.random() * 1.1 : Math.random() * 2.4;
    ctx.globalAlpha = 0.35 + Math.random() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(0,180,216,0.90)";
  ctx.font =
    "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Quantum Teal Sky", w / 2, 90);

  return c;
}

function pano_neon_grid() {
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width,
    h = c.height;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#070010");
  bg.addColorStop(0.6, "#02000a");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.9;
  for (let y = 0; y < h; y += 32) {
    ctx.strokeStyle = `rgba(123,44,191,${y < h / 2 ? 0.10 : 0.04})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 0; x < w; x += 48) {
    ctx.strokeStyle = `rgba(0,180,216,0.06)`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(123,44,191,0.90)";
  ctx.font =
    "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Neon Grid", w / 2, 90);

  return c;
}

function pano_studio_loft() {
  const c = createPanoCanvas();
  const ctx = c.getContext("2d");
  const w = c.width,
    h = c.height;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#050510");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const win = ctx.createRadialGradient(
    w * 0.75,
    h * 0.35,
    20,
    w * 0.75,
    h * 0.35,
    520
  );
  win.addColorStop(0, "rgba(255,255,255,0.18)");
  win.addColorStop(0.5, "rgba(0,180,216,0.08)");
  win.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = win;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,180,216,0.85)";
  ctx.font =
    "bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sapphire Multiverse • Studio Loft", w / 2, 90);

  return c;
}

function buildProceduralByKey(key) {
  if (key === "teal_sky") return pano_teal_sky();
  if (key === "neon_grid") return pano_neon_grid();
  if (key === "studio_loft") return pano_studio_loft();
  return pano_teal_sky();
}

/* SHADERS */
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

/* WEBGL GLOBALS */
let gl;
let program;
let quadVbo;
let texA, texB;
let a_pos, u_texA, u_texB, u_mix, u_rot, u_tanHalfFov, u_aspect;
let webglOK = false;

/* WEBGL HELPERS */
function createGL(canvas) {
  return (
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  );
}

function createShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    throw new Error("Shader compile failed");
  }
  return sh;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    throw new Error("Program link failed");
  }
  return prog;
}

function makeTexture(gl) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return t;
}

function uploadCanvasToTexture(gl, tex, canvas) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

/* ROTATION */
function computeRotationMatrix(yawDeg, pitchDeg) {
  const yaw = degToRad(yawDeg);
  const pitch = degToRad(pitchDeg);

  const cy = Math.cos(yaw),
    sy = Math.sin(yaw);
  const cx = Math.cos(pitch),
    sx = Math.sin(pitch);

  return new Float32Array([
    cy,
    sy * sx,
    sy * cx,
    0.0,
    cx,
    -sx,
    -sy,
    cy * sx,
    cy * cx,
  ]);
}

/* CANVAS RESIZE */
function resizeCanvasToDisplaySize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}
window.addEventListener("resize", resizeCanvasToDisplaySize);

/* TEXTURE SYNC */
function ensureTextureAIsCurrent() {
  if (!gl || !webglOK) return;
  const scene = state.scenes[state.activeScene];
  let panoCanvas;

  if (scene.kind === "procedural") {
    panoCanvas = buildProceduralByKey(scene.source);
  } else if (scene.kind === "file" && scene.image) {
    const c = createPanoCanvas();
    const ctx = c.getContext("2d");
    ctx.drawImage(scene.image, 0, 0, c.width, c.height);
    panoCanvas = c;
  } else {
    panoCanvas = buildProceduralByKey("teal_sky");
  }

  uploadCanvasToTexture(gl, texA, panoCanvas);
}

/* WEBGL INIT */
function initWebGL() {
  gl = createGL(canvas);
  if (!gl) {
    log("WEBGL", "WebGL unavailable on this browser");
    return;
  }

  program = createProgram(gl, vsSource, fsSource);
  webglOK = true;

  a_pos = gl.getAttribLocation(program, "a_pos");
  u_texA = gl.getUniformLocation(program, "u_texA");
  u_texB = gl.getUniformLocation(program, "u_texB");
  u_mix = gl.getUniformLocation(program, "u_mix");
  u_rot = gl.getUniformLocation(program, "u_rot");
  u_tanHalfFov = gl.getUniformLocation(program, "u_tanHalfFov");
  u_aspect = gl.getUniformLocation(program, "u_aspect");

  quadVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1, 1, -1, -1, 1, //
      -1, 1, 1, -1, 1, 1,
    ]),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  texA = makeTexture(gl);
  texB = makeTexture(gl);

  gl.clearColor(0, 0, 0, 1);
}

function initWebGLSafe() {
  try {
    initWebGL();
    ensureTextureAIsCurrent();
    log("WEBGL", "WebGL pano engine online.");
  } catch (err) {
    log("ERROR", "WebGL init failed: " + err.message);
    webglOK = false;
  }
}

/* RENDER */
function renderWebGL() {
  if (!webglOK) return;

  resizeCanvasToDisplaySize();
  gl.viewport(0, 0, canvas.width, canvas.height);

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

/* SCENES UI */
function renderScenes() {
  sceneListEl.innerHTML = "";
  state.scenes.forEach((scene, idx) => {
    const div = document.createElement("div");
    div.className = "scene" + (idx === state.activeScene ? " active" : "");
    div.innerHTML = `
      <div class="name mono">${escapeHTML(scene.name)}</div>
      <div class="meta mono micro dim">${escapeHTML(scene.kind.toUpperCase())}</div>
    `;
    div.addEventListener("click", () => {
      switchToSceneIndex(idx);
    });
    sceneListEl.appendChild(div);
  });
}

function updateSceneReadout() {
  const scene = state.scenes[state.activeScene];
  sceneReadoutEl.textContent = `Scene: ${scene.name}`;
}

function switchToSceneIndex(i) {
  if (i < 0 || i >= state.scenes.length) return;
  state.activeScene = i;
  renderScenes();
  updateSceneReadout();
  ensureTextureAIsCurrent();
  startTransition();
  track("scene_switch", { sceneId: state.scenes[i].id });
}

/* TRANSITION */
function startTransition() {
  state.transitioning = true;
  state.transitionStart = performance.now();
  state.transitionMix = 0;
}

/* ADD SCENE FROM FILE */
function addSceneFromFile(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const id = `file_${Date.now()}`;
    state.scenes.push({
      id,
      name: file.name,
      kind: "file",
      image: img,
    });
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

/* CAMERA LABELS + GRADE */
function syncCameraLabels() {
  yawVal.textContent = state.targetYaw.toFixed(0);
  pitchVal.textContent = state.targetPitch.toFixed(0);
  zoomVal.textContent = state.zoom.toFixed(2);
  fadeVal.textContent = state.fadeMs.toFixed(0);
}

function syncGradeLabels() {
  contrastVal.textContent = state.contrast.toFixed(2);
  satVal.textContent = state.saturate.toFixed(2);
  hueVal.textContent = state.hue.toFixed(0);
}

function applyGradeToCSS() {
  document.documentElement.style.setProperty(
    "--contrast",
    state.contrast.toString()
  );
  document.documentElement.style.setProperty(
    "--saturate",
    state.saturate.toString()
  );
  document.documentElement.style.setProperty(
    "--hue",
    `${state.hue}deg`
  );
}

/* TIME / TRANSPORT */
function updateTimeReadout() {
  const totalSec = state.maxFrame / 24; // assume 24fps
  const curSec = state.frame / 24;

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  timeReadout.textContent = `${fmt(curSec)} / ${fmt(totalSec)}`;
}

/* GYRO */
function updateGyroReadout() {
  gyroReadoutEl.textContent = `α: ${state.gyroAlpha.toFixed(
    1
  )}  β: ${state.gyroBeta.toFixed(1)}  γ: ${state.gyroGamma.toFixed(1)}`;
}

function handleDeviceOrientation(e) {
  if (!state.gyroEnabled) return;
  const { alpha, beta, gamma } = e;
  state.gyroAlpha = alpha || 0;
  state.gyroBeta = beta || 0;
  state.gyroGamma = gamma || 0;

  // Map beta/gamma to pitch/yaw gently
  state.targetYaw = clamp(gamma || 0, -90, 90) * 1.2;
  state.targetPitch = clamp(beta || 0, -60, 60) * 0.8;

  updateGyroReadout();
}

/* COMMAND BAR */
function openCmdBar() {
  cmdBackdrop.hidden = false;
  cmdbar.hidden = false;
  cmdInput.value = "";
  cmdInput.focus();
}
function closeCmdBar() {
  cmdBackdrop.hidden = true;
  cmdbar.hidden = true;
}
function handleCommand(cmd) {
  const c = cmd.trim().toLowerCase();
  if (!c) return;
  if (c === "next scene") {
    switchToSceneIndex((state.activeScene + 1) % state.scenes.length);
  } else if (c === "prev scene") {
    switchToSceneIndex(
      (state.activeScene - 1 + state.scenes.length) % state.scenes.length
    );
  } else if (c === "center") {
    state.targetYaw = 0;
    state.targetPitch = 0;
  } else if (c === "gyro") {
    toggleGyro();
  } else if (c === "export json") {
    downloadProjectJSON();
  } else {
    log("CMD", `Unknown command: ${cmd}`);
  }
}

/* EXPORT JSON */
function downloadProjectJSON() {
  const payload = {
    scenes: state.scenes.map((s) => ({
      id: s.id,
      name: s.name,
      kind: s.kind,
      source: s.source || null,
    })),
    camera: {
      yaw: state.yaw,
      pitch: state.pitch,
      zoom: state.zoom,
    },
    grade: {
      contrast: state.contrast,
      saturate: state.saturate,
      hue: state.hue,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sapphire-project.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  log("EXPORT", "Project JSON downloaded.");
  track("export_json", {});
}

/* GYRO TOGGLE */
function toggleGyro() {
  state.gyroEnabled = !state.gyroEnabled;
  btnGyro.textContent = state.gyroEnabled ? "Disable Gyro" : "Enable Gyro";
  track("gyro_toggle", { enabled: state.gyroEnabled });
}

/* LOOP STEP ANIMATION (AWAKEN → PERCEIVE → RESOLVE → MANIFEST) */
let loopPhase = 0;
function advanceLoopPhase() {
  loopPhase = (loopPhase + 1) % loopSteps.length;
  loopSteps.forEach((el, idx) => {
    el.classList.toggle("active", idx === loopPhase);
  });
}

/* MAIN LOOP */
function updateTransition() {
  if (!state.transitioning) return;
  const now = performance.now();
  const t = clamp((now - state.transitionStart) / state.fadeMs, 0, 1);
  state.transitionMix = t;
  if (t >= 1) {
    state.transitioning = false;
    state.transitionMix = 0;
  }
}

function tick() {
  if (state.playing) {
    state.frame = (state.frame + 1) % (state.maxFrame + 1);
    timeline.value = state.frame;
    updateTimeReadout();
  }

  // smooth camera easing
  const ease = 0.08;
  state.yaw += (state.targetYaw - state.yaw) * ease;
  state.pitch += (state.targetPitch - state.pitch) * ease;

  updateTransition();
  renderWebGL();

  requestAnimationFrame(tick);
}

/* EVENT WIRING */
function wireEvents() {
  btnPrevScene.addEventListener("click", () => {
    switchToSceneIndex(
      (state.activeScene - 1 + state.scenes.length) % state.scenes.length
    );
  });
  btnNextScene.addEventListener("click", () => {
    switchToSceneIndex((state.activeScene + 1) % state.scenes.length);
  });
  btnAddScene.addEventListener("click", () => {
    sceneFile.click();
  });
  sceneFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) addSceneFromFile(file);
    sceneFile.value = "";
  });

  btnGyro.addEventListener("click", toggleGyro);
  btnCenter.addEventListener("click", () => {
    state.targetYaw = 0;
    state.targetPitch = 0;
  });
  btnExport.addEventListener("click", downloadProjectJSON);

  btnPlay.addEventListener("click", () => {
    state.playing = true;
  });
  btnPause.addEventListener("click", () => {
    state.playing = false;
  });
  btnStop.addEventListener("click", () => {
    state.playing = false;
    state.frame = 0;
    timeline.value = 0;
    updateTimeReadout();
  });
  timeline.addEventListener("input", () => {
    state.frame = Number(timeline.value);
    updateTimeReadout();
  });

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

  contrast.addEventListener("input", () => {
    state.contrast = Number(contrast.value);
    syncGradeLabels();
    applyGradeToCSS();
  });
  sat.addEventListener("input", () => {
    state.saturate = Number(sat.value);
    syncGradeLabels();
    applyGradeToCSS();
  });
  hue.addEventListener("input", () => {
    state.hue = Number(hue.value);
    syncGradeLabels();
    applyGradeToCSS();
  });

  // Command bar
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCmdBar();
    } else if (e.key === "Escape") {
      closeCmdBar();
    }
  });
  cmdBackdrop.addEventListener("click", closeCmdBar);
  cmdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleCommand(cmdInput.value);
      closeCmdBar();
    }
  });

  // Gyro
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  }

  // Loop phase
  setInterval(advanceLoopPhase, 4000);
}

/* INIT */
(function init() {
  log("BOOT", "Sapphire Multiverse online.");
  log("UI", "Studio portal loaded.");

  state.targetYaw = 0;
  state.targetPitch = 0;
  state.zoom = Number(zoomSlider.value);
  state.fadeMs = Number(fadeSlider.value);

  state.contrast = Number(contrast.value);
  state.saturate = Number(sat.value);
  state.hue = Number(hue.value);

  syncCameraLabels();
  syncGradeLabels();
  applyGradeToCSS();
  updateTimeReadout();
  updateSceneReadout();
  renderScenes();

  wireEvents();
  initWebGLSafe();
  tick();
})();
