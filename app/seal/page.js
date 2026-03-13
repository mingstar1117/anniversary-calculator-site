'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const SEAL_WIDTH = 236;
const SEAL_HEIGHT = 134;
const TARGET_MARGIN = 96;
const AVOID_RADIUS = 260;
const PANIC_RADIUS = 150;
const MAX_SPEED = 3.2;

const BUBBLES = Array.from({ length: 16 }, (_, index) => ({
  left: `${((index * 17 + 8) % 100).toFixed(1)}%`,
  size: `${10 + ((index * 7) % 24)}px`,
  delay: `${(index * 0.65).toFixed(2)}s`,
  duration: `${11 + (index % 6) * 2}s`,
  drift: `${-28 + ((index * 11) % 56)}px`,
  opacity: (0.14 + (index % 5) * 0.09).toFixed(2),
}));

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function pickTarget(width, height) {
  const stageMaxX = Math.max(0, width - SEAL_WIDTH);
  const stageMaxY = Math.max(0, height - SEAL_HEIGHT);
  const minX = Math.min(TARGET_MARGIN, stageMaxX);
  const minY = Math.min(TARGET_MARGIN, stageMaxY);
  const maxX = Math.max(minX, stageMaxX - TARGET_MARGIN);
  const maxY = Math.max(minY, stageMaxY - TARGET_MARGIN);

  return {
    x: minX + Math.random() * (maxX - minX || 1),
    y: minY + Math.random() * (maxY - minY || 1),
  };
}

export default function HomePage() {
  const fieldRef = useRef(null);
  const sealRef = useRef(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const motionRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const field = fieldRef.current;
    const seal = sealRef.current;
    if (!field || !seal) return undefined;

    const state = motionRef.current;
    const initialize = () => {
      const width = field.clientWidth;
      const height = field.clientHeight;
      state.x = Math.max(0, (width - SEAL_WIDTH) * 0.5);
      state.y = Math.max(0, (height - SEAL_HEIGHT) * 0.5);
      const firstTarget = pickTarget(width, height);
      state.targetX = firstTarget.x;
      state.targetY = firstTarget.y;
      state.vx = 0;
      state.vy = 0;
      state.lastTime = 0;
    };

    initialize();

    const onPointerMove = (event) => {
      const rect = field.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    const onResize = () => {
      const width = field.clientWidth;
      const height = field.clientHeight;
      const maxX = Math.max(0, width - SEAL_WIDTH);
      const maxY = Math.max(0, height - SEAL_HEIGHT);
      state.x = clamp(state.x, 0, maxX);
      state.y = clamp(state.y, 0, maxY);
      const retarget = pickTarget(width, height);
      state.targetX = retarget.x;
      state.targetY = retarget.y;
      state.lastTime = 0;
    };

    const step = (timestamp) => {
      const width = field.clientWidth;
      const height = field.clientHeight;
      const maxX = Math.max(0, width - SEAL_WIDTH);
      const maxY = Math.max(0, height - SEAL_HEIGHT);

      if (!state.lastTime) state.lastTime = timestamp;
      const delta = Math.min((timestamp - state.lastTime) / 16.666, 2.4);
      state.lastTime = timestamp;

      let targetDx = state.targetX - state.x;
      let targetDy = state.targetY - state.y;
      let targetDistance = Math.hypot(targetDx, targetDy);

      if (targetDistance < 52) {
        const nextTarget = pickTarget(width, height);
        state.targetX = nextTarget.x;
        state.targetY = nextTarget.y;
        targetDx = state.targetX - state.x;
        targetDy = state.targetY - state.y;
        targetDistance = Math.hypot(targetDx, targetDy);
      }

      if (targetDistance > 0.001) {
        const pull = 0.08 * delta;
        state.vx += (targetDx / targetDistance) * pull;
        state.vy += (targetDy / targetDistance) * pull;
      }

      if (mouseRef.current.active) {
        const sealCenterX = state.x + SEAL_WIDTH * 0.5;
        const sealCenterY = state.y + SEAL_HEIGHT * 0.5;
        const awayX = sealCenterX - mouseRef.current.x;
        const awayY = sealCenterY - mouseRef.current.y;
        const mouseDistance = Math.hypot(awayX, awayY);

        if (mouseDistance < AVOID_RADIUS) {
          const danger = (AVOID_RADIUS - mouseDistance) / AVOID_RADIUS;
          const push = 0.5 * danger * danger * delta;

          if (mouseDistance > 0.001) {
            state.vx += (awayX / mouseDistance) * push;
            state.vy += (awayY / mouseDistance) * push;
          } else {
            state.vx += (Math.random() - 0.5) * 0.9;
            state.vy += (Math.random() - 0.5) * 0.9;
          }

          if (mouseDistance < PANIC_RADIUS) {
            const fleeX = sealCenterX + (awayX || (Math.random() - 0.5) * 90) * 1.9;
            const fleeY = sealCenterY + (awayY || (Math.random() - 0.5) * 90) * 1.9;
            state.targetX = clamp(fleeX - SEAL_WIDTH * 0.5, 0, maxX);
            state.targetY = clamp(fleeY - SEAL_HEIGHT * 0.5, 0, maxY);
          }
        }
      }

      const speed = Math.hypot(state.vx, state.vy);
      if (speed > MAX_SPEED) {
        const ratio = MAX_SPEED / speed;
        state.vx *= ratio;
        state.vy *= ratio;
      }

      const drag = Math.pow(0.986, delta);
      state.vx *= drag;
      state.vy *= drag;

      state.x += state.vx * delta;
      state.y += state.vy * delta;

      if (state.x < 0) {
        state.x = 0;
        state.vx = Math.abs(state.vx) * 0.75;
      }
      if (state.x > maxX) {
        state.x = maxX;
        state.vx = -Math.abs(state.vx) * 0.75;
      }
      if (state.y < 0) {
        state.y = 0;
        state.vy = Math.abs(state.vy) * 0.75;
      }
      if (state.y > maxY) {
        state.y = maxY;
        state.vy = -Math.abs(state.vy) * 0.75;
      }

      const facing = state.vx >= 0 ? 1 : -1;
      const tilt = clamp(state.vy * 7, -16, 16);
      const swimPower = clamp(Math.hypot(state.vx, state.vy) / MAX_SPEED, 0.2, 1);

      seal.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scaleX(${facing}) rotate(${tilt.toFixed(2)}deg)`;
      seal.style.setProperty('--swim-power', swimPower.toFixed(2));

      frameRef.current = requestAnimationFrame(step);
    };

    field.addEventListener('pointermove', onPointerMove);
    field.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);
    frameRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameRef.current);
      field.removeEventListener('pointermove', onPointerMove);
      field.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <main className="night-ocean" ref={fieldRef} aria-label="물개가 헤엄치는 장면">
      <Link href="/" className="seal-home-link">
        메뉴로
      </Link>
      <div className="night-ocean__grain" aria-hidden="true" />
      <div className="night-ocean__vignette" aria-hidden="true" />

      <div className="bubbles" aria-hidden="true">
        {BUBBLES.map((bubble, index) => (
          <span
            key={`bubble-${index}`}
            style={{
              '--left': bubble.left,
              '--size': bubble.size,
              '--delay': bubble.delay,
              '--duration': bubble.duration,
              '--drift': bubble.drift,
              '--opacity': bubble.opacity,
            }}
          />
        ))}
      </div>

      <p className="guide">마우스를 물개 쪽으로 가져가면 부끄러워서 도망가요.</p>

      <div className="seal" ref={sealRef} role="img" aria-label="마우스를 피해 헤엄치는 귀여운 물개">
        <div className="seal__inner">
          <svg className="seal-svg" viewBox="0 0 420 240" aria-hidden="true">
            <defs>
              <linearGradient id="sealBodyGradient" x1="58" y1="40" x2="296" y2="204" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#cfd5df" />
                <stop offset="58%" stopColor="#a8b2c2" />
                <stop offset="100%" stopColor="#828fa4" />
              </linearGradient>
              <radialGradient id="sealBodyHighlight" cx="236" cy="88" r="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.62)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
              <linearGradient id="sealBellyGradient" x1="170" y1="108" x2="276" y2="184" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#eef4fb" />
                <stop offset="100%" stopColor="#d1dceb" />
              </linearGradient>
              <linearGradient id="sealHeadGradient" x1="296" y1="26" x2="366" y2="148" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#dbe1ea" />
                <stop offset="50%" stopColor="#b7c2d4" />
                <stop offset="100%" stopColor="#8e9bb1" />
              </linearGradient>
              <linearGradient id="sealFlipperGradient" x1="188" y1="132" x2="266" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a7b2c3" />
                <stop offset="100%" stopColor="#77849b" />
              </linearGradient>
              <filter id="sealHeadSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3.2" floodColor="rgba(16, 24, 35, 0.42)" />
              </filter>
            </defs>

            <g className="seal-svg__back-flipper">
              <path
                d="M171 172C148 176 127 184 114 198C130 203 152 202 171 193C185 187 195 176 200 166C191 166 183 168 171 172Z"
                fill="url(#sealFlipperGradient)"
              />
            </g>

            <g className="seal-svg__tail">
              <path d="M72 124C48 124 31 134 20 154C41 152 57 146 68 138C74 134 78 130 82 124H72Z" fill="#8f9eb3" />
              <path d="M73 138C50 142 33 153 24 173C46 170 62 161 74 151C80 146 84 141 88 136L73 138Z" fill="#7c8da6" />
              <path d="M82 123C88 135 88 148 82 160" stroke="#ced7e4" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
            </g>

            <g className="seal-svg__body">
              <path
                d="M91 111C98 73 129 52 182 50C249 48 308 70 319 99C330 129 308 167 250 179C173 194 96 170 91 111Z"
                fill="url(#sealBodyGradient)"
              />
              <path
                d="M124 88C153 64 240 62 286 90C301 99 306 112 302 126C295 97 244 82 186 84C156 85 129 91 111 102C111 95 115 91 124 88Z"
                fill="url(#sealBodyHighlight)"
                opacity="0.55"
              />
              <ellipse cx="235" cy="139" rx="79" ry="34" fill="url(#sealBellyGradient)" opacity="0.88" />
              <ellipse cx="219" cy="131" rx="68" ry="26" fill="rgba(255,255,255,0.25)" />

              <circle cx="146" cy="104" r="7" fill="rgba(96, 108, 124, 0.28)" />
              <circle cx="177" cy="88" r="10" fill="rgba(88, 99, 116, 0.24)" />
              <circle cx="225" cy="86" r="8" fill="rgba(90, 102, 120, 0.22)" />
              <circle cx="266" cy="106" r="9" fill="rgba(88, 98, 114, 0.2)" />
              <circle cx="258" cy="132" r="7" fill="rgba(84, 95, 112, 0.18)" />
              <circle cx="193" cy="112" r="6" fill="rgba(84, 95, 112, 0.16)" />
            </g>

            <g className="seal-svg__front-flipper">
              <path
                d="M253 155C274 161 292 175 304 196C283 196 266 191 252 181C242 174 236 164 233 153C239 152 245 153 253 155Z"
                fill="url(#sealFlipperGradient)"
              />
              <path d="M244 162C258 173 271 183 285 188" stroke="rgba(237, 245, 255, 0.4)" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            <g className="seal-svg__head" filter="url(#sealHeadSoftShadow)">
              <ellipse cx="315" cy="97" rx="55" ry="50" fill="url(#sealHeadGradient)" />
              <ellipse cx="321" cy="116" rx="37" ry="29" fill="rgba(233, 242, 252, 0.86)" />
              <ellipse cx="310" cy="82" rx="26" ry="15" fill="rgba(255,255,255,0.36)" />

              <circle cx="302" cy="91" r="8.5" fill="#1d2631" />
              <circle cx="328" cy="92" r="8.5" fill="#1d2631" />
              <circle cx="299" cy="88" r="2.3" fill="rgba(255,255,255,0.92)" />
              <circle cx="325" cy="89" r="2.3" fill="rgba(255,255,255,0.92)" />

              <ellipse className="seal-svg__eye-lid seal-svg__eye-lid--left" cx="302" cy="91" rx="9.5" ry="0.6" fill="#aeb8c9" />
              <ellipse className="seal-svg__eye-lid seal-svg__eye-lid--right" cx="328" cy="92" rx="9.5" ry="0.6" fill="#aeb8c9" />

              <path d="M316 108C320 109 323 112 323 117C323 123 318 126 313 126C307 126 302 123 302 117C302 112 306 109 311 108H316Z" fill="#2b3440" />
              <ellipse cx="308" cy="115.5" rx="1.7" ry="2.2" fill="#141b24" />
              <ellipse cx="318" cy="115.5" rx="1.7" ry="2.2" fill="#141b24" />
              <path d="M310 126C313 129 316 129 319 126" fill="none" stroke="#253140" strokeWidth="2" strokeLinecap="round" />

              <path d="M290 116L272 111M291 122L272 123M291 128L274 135" stroke="#263241" strokeWidth="2.1" strokeLinecap="round" />
              <path d="M340 116L358 111M339 122L358 123M339 128L356 135" stroke="#263241" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </main>
  );
}
