// Sapphire Q44 — Standalone first screen (no Chronos, no external links)


const canvas = document.getElementById("render");

const ctx = canvas.getContext("2d");


const viewportStage = document.getElementById("viewportStage");

const stateText = document.getElementById("stateText");

const sceneText = document.getElementById("sceneText");

const phaseText = document.getElementById("phaseText");


const energy = document.getElementById("energy");

const energyText = document.getElementById("energyText");


const bloom = document.getElementById("bloom");

const bloomVal = document.getElementById("bloomVal");


const drift = document.getElementById("drift");

const driftVal = document.getElementById("driftVal");


const chromatic = document.getElementById("chromatic");

const chrVal = document.getElementById("chrVal");


const btnCenter = document.getElementById("btnCenter");

const btnPulse = document.getElementById("btnPulse");


const phases = ["AWAKEN", "PERCEIVE", "RESOLVE", "MANIFEST"];

let phaseIndex = 0;


let w = 0, h = 0, t = 0;

let yaw = 0, pitch = 0;

let targetYaw = 0, targetPitch = 0;

let dragging = false;

let lastX = 0, lastY = 0;


function resize() {

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const rect = canvas.getBoundingClientRect();

  w = Math.floor(rect.width * dpr);

  h = Math.floor(rect.height * dpr);

  canvas.width = w;

  canvas.height = h;

}

window.addEventListener("resize", resize);

resize();


function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }


viewportStage.addEventListener("pointerdown", (e) => {

  dragging = true;

  lastX = e.clientX;

  lastY = e.clientY;

});

viewportStage.addEventListener("pointermove", (e) => {

  if (!dragging) return;

  const dx = e.clientX - lastX;

  const dy = e.clientY - lastY;

  lastX = e.clientX;

  lastY = e.clientY;


  targetYaw += dx * 0.22;

  targetPitch += dy * 0.18;

  targetPitch = clamp(targetPitch, -65, 65);

});

["pointerup","pointercancel","pointerleave"].forEach(evt =>

  viewportStage.addEventListener(evt, () => dragging = false)

);


btnCenter.addEventListener("click", () => {

  targetYaw = 0;

  targetPitch = 0;

});


btnPulse.addEventListener("click", () => {

  // quick pulse effect by jumping energy briefly

  energy.value = 88;

  updateUI();

  setTimeout(() => { energy.value = 44; updateUI(); }, 180);

});


function updateUI(){

  energyText.textContent = `ENERGY ${energy.value}`;

  bloomVal.textContent = Number(bloom.value).toFixed(2);

  driftVal.textContent = Number(drift.value).toFixed(2);

  chrVal.textContent = Number(chromatic.value).toFixed(2);

}

["input","change"].forEach(evt => {

  energy.addEventListener(evt, updateUI);

  bloom.addEventListener(evt, updateUI);

  drift.addEventListener(evt, updateUI);

  chromatic.addEventListener(evt, updateUI);

});

updateUI();


// Minimal cinematic render: starfield + teal/orchid aurora + orbit drift

function draw() {

  t += 0.016;


  // ease toward target

  yaw += (targetYaw - yaw) * 0.08;

  pitch += (targetPitch - pitch) * 0.08;


  const E = Number(energy.value) / 100;

  const B = Number(bloom.value);

  const D = Number(drift.value);

  const Cc = Number(chromatic.value);


  // base

  ctx.fillStyle = "#0a0a14";

  ctx.fillRect(0,0,w,h);


  // stars

  const starCount = Math.floor((w*h) * 0.00003);

  for (let i=0; i<starCount; i++){

    const x = (Math.sin(i*12.9898 + t*0.15) * 43758.5453) % 1;

    const y = (Math.sin(i*78.233  + t*0.11) * 12345.6789) % 1;

    const px = ((x<0?x+1:x) * w);

    const py = ((y<0?y+1:y) * h);

    const a = 0.25 + (i%7)/10;

    ctx.fillStyle = `rgba(244,241,234,${a})`;

    ctx.fillRect(px, py, 1.2, 1.2);

  }


  // aurora ribbons (teal/orchid dominant)

  const cx = w*0.5 + Math.sin(t*D)*w*0.08 + yaw*0.6;

  const cy = h*0.35 + Math.cos(t*D*0.8)*h*0.05 + pitch*0.4;


  const grd = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w,h)*0.7);

  grd.addColorStop(0.00, `rgba(0,180,216,${0.18 + E*0.18})`);

  grd.addColorStop(0.35, `rgba(123,44,191,${0.12 + E*0.14})`);

  grd.addColorStop(0.65, `rgba(42,91,255,${0.06 + E*0.10})`);

  grd.addColorStop(1.00, `rgba(0,0,0,0)`);


  ctx.fillStyle = grd;

  ctx.fillRect(0,0,w,h);


  // subtle chromatic shimmer lines (no red dominance)

  ctx.globalAlpha = 0.35 + Cc*0.25;

  for (let k=0; k<6; k++){

    const yy = h*(0.18 + k*0.12) + Math.sin(t*0.8 + k)*14;

    const lg = ctx.createLinearGradient(0,yy,w,yy);

    lg.addColorStop(0, "rgba(0,0,0,0)");

    lg.addColorStop(0.35, `rgba(0,180,216,${0.10 + B*0.18})`);

    lg.addColorStop(0.65, `rgba(123,44,191,${0.08 + B*0.16})`);

    lg.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = lg;

    ctx.fillRect(0, yy-18, w, 36);

  }

  ctx.globalAlpha = 1;


  // bloom “feel” via soft overlay (lightweight)

  ctx.globalCompositeOperation = "screen";

  ctx.globalAlpha = 0.10 + B*0.18;

  ctx.fillStyle = "rgba(0,180,216,1)";

  ctx.fillRect(0,0,w,h);

  ctx.globalAlpha = 0.06 + B*0.12;

  ctx.fillStyle = "rgba(123,44,191,1)";

  ctx.fillRect(0,0,w,h);

  ctx.globalCompositeOperation = "source-over";

  ctx.globalAlpha = 1;


  requestAnimationFrame(draw);

}

draw();


// phase loop (1.5s per phase like your Q44 rhythm)

setInterval(() => {

  phaseIndex = (phaseIndex + 1) % phases.length;

  stateText.textContent = phases[phaseIndex];

  phaseText.textContent = `${phases.join(" → ")}`;

}, 1500);


