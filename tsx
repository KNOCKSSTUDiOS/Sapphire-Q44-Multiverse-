.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: radial-gradient(circle at 20% 0%, #0b1b24 0, #020308 45%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: introFadeIn 600ms ease-out forwards;
}

@keyframes introFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.intro-inner {
  text-align: center;
  padding: 24px 32px;
  border-radius: 24px;
  background: rgba(3, 6, 14, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(18px) saturate(1.3);
}

.intro-line {
  position: relative;
  overflow: hidden;
  margin: 6px 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-size: 12px;
}

.intro-line-text {
  position: relative;
  z-index: 1;
}

.intro-line-teal { color: #7ee7ff; }
.intro-line-violet { color: #d0b3ff; }
.intro-line-amber { color: #ffe9a3; }
.intro-line-core { color: #ffffff; font-size: 13px; }

.intro-line-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 260ms ease-out, transform 260ms ease-out;
}

.intro-line-inactive {
  opacity: 0.4;
  transform: translateY(2px);
}

.intro-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.7) 45%,
    transparent 70%
  );
  transform: translateX(-120%);
  mix-blend-mode: screen;
  opacity: 0;
}

.intro-shine-run .intro-shine {
  opacity: 1;
  animation: introShineSweep 900ms cubic-bezier(.19,1,.22,1) forwards;
}

@keyframes introShineSweep {
  0% { transform: translateX(-120%); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(120%); opacity: 0; }
}

