"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";

// Double-well potential: V(x) = depth*(x^2 - 1)^2 + asym*x
// Minima near x = -1 (well A) and x = +1 (well B)
function potential(x: number, depth: number, asym: number) {
  return depth * (x * x - 1) * (x * x - 1) + asym * x;
}

function dV(x: number, depth: number, asym: number) {
  return depth * 4 * x * (x * x - 1) + asym;
}

function runSimulation(x0: number, depth: number, noise: number, steps: number): number[] {
  const traj: number[] = [x0];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    const force = -dV(x, depth, 0);
    const n = (Math.random() - 0.5) * 2 * noise * 0.15;
    x = x + force * 0.02 + n;
    x = Math.max(-2.2, Math.min(2.2, x));
    traj.push(x);
  }
  return traj;
}

export function AttractorBasin() {
  const { lang } = useLang();
  const [depth, setDepth] = useState(1.0);
  const [asym, setAsym] = useState(0.0);
  const [noise, setNoise] = useState(0.5);
  const [particleX, setParticleX] = useState(-1.0);
  const [traj, setTraj] = useState<number[]>([-1.0]);
  const animRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const fullTrajRef = useRef<number[]>([]);

  const simulate = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const full = runSimulation(particleX, depth, noise, 100);
    fullTrajRef.current = full;
    stepRef.current = 0;
    setTraj([full[0]]);

    const step = () => {
      stepRef.current++;
      if (stepRef.current < full.length) {
        setParticleX(full[stepRef.current]);
        setTraj(full.slice(0, stepRef.current + 1));
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [particleX, depth, noise]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const perturbAndSimulate = useCallback(() => {
    const kicked = particleX + (Math.random() - 0.5) * 1.2;
    const bounded = Math.max(-2.2, Math.min(2.2, kicked));
    setParticleX(bounded);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const full = runSimulation(bounded, depth, noise, 100);
    fullTrajRef.current = full;
    stepRef.current = 0;
    setTraj([full[0]]);
    const step = () => {
      stepRef.current++;
      if (stepRef.current < full.length) {
        setParticleX(full[stepRef.current]);
        setTraj(full.slice(0, stepRef.current + 1));
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [particleX, depth, noise]);

  // SVG dimensions
  const W = 560;
  const H = 180;
  const PAD = { l: 36, r: 12, t: 10, b: 28 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const xs = Array.from({ length: 80 }, (_, i) => -2.2 + (i / 79) * 4.4);
  const ys = xs.map(x => potential(x, depth, asym));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;

  function toSVGX(x: number) {
    return PAD.l + ((x + 2.2) / 4.4) * plotW;
  }
  function toSVGY(y: number) {
    return PAD.t + plotH - ((y - minY) / rangeY) * plotH;
  }

  const curvePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${toSVGX(x).toFixed(1)},${toSVGY(ys[i]).toFixed(1)}`).join(" ");

  // particle
  const pY = potential(particleX, depth, asym);
  const pSvgX = toSVGX(particleX);
  const pSvgY = toSVGY(pY);

  // attractor positions (rough minima)
  const xA = asym < 0 ? -1.1 : -1.0;
  const xB = asym > 0 ? 1.1 : 1.0;
  const inWellA = particleX < 0;

  // residence from trajectory
  const timeA = traj.filter(v => v < 0).length;
  const timeB = traj.filter(v => v >= 0).length;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="k mb-1">{lang === "zh" ? "双阱势能 · 吸引子盆地" : "Double-well potential · attractor basins"}</div>
        <h3 className="text-[18px] font-medium mb-4">
          {lang === "zh" ? "系统身份由吸引子盆地定义，而非瞬时状态" : "System identity is defined by attractor basins, not instantaneous state"}
        </h3>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          {/* well zones */}
          <rect x={PAD.l} y={PAD.t} width={plotW / 2} height={plotH} fill="rgba(124,255,203,0.03)" />
          <rect x={PAD.l + plotW / 2} y={PAD.t} width={plotW / 2} height={plotH} fill="rgba(86,207,255,0.03)" />
          {/* axes */}
          <line x1={PAD.l} y1={PAD.t + plotH} x2={PAD.l + plotW} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
          {/* potential curve */}
          <path d={curvePath} fill="none" stroke="var(--baseline)" strokeWidth="2" />
          {/* attractor markers */}
          <line x1={toSVGX(xA)} y1={PAD.t} x2={toSVGX(xA)} y2={PAD.t + plotH} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          <line x1={toSVGX(xB)} y1={PAD.t} x2={toSVGX(xB)} y2={PAD.t + plotH} stroke="var(--tail)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          {/* particle */}
          <circle cx={pSvgX} cy={pSvgY} r="7" fill="var(--warn)" opacity="0.9" />
          <circle cx={pSvgX} cy={pSvgY} r="4" fill="var(--warn)" />
          {/* labels */}
          <text x={toSVGX(-1.5)} y={PAD.t + 14} fill="var(--accent)" fontSize="10" fontFamily="monospace">A</text>
          <text x={toSVGX(1.3)} y={PAD.t + 14} fill="var(--tail)" fontSize="10" fontFamily="monospace">B</text>
          <text x={PAD.l + plotW / 2} y={PAD.t + plotH + 18} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="middle">x=0 (unstable)</text>
        </svg>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "阱深" : "Well depth"}</div>
          <input type="range" min={0.3} max={3.0} step={0.05} value={depth} onChange={e => setDepth(parseFloat(e.target.value))} className="w-full mb-2" />
          <div className="font-mono text-[12px] text-center" style={{ color: "var(--accent)" }}>{depth.toFixed(2)}</div>
        </div>
        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "不对称度" : "Asymmetry"}</div>
          <input type="range" min={-1.0} max={1.0} step={0.05} value={asym} onChange={e => setAsym(parseFloat(e.target.value))} className="w-full mb-2" />
          <div className="font-mono text-[12px] text-center" style={{ color: "var(--baseline)" }}>{asym >= 0 ? "+" : ""}{asym.toFixed(2)}</div>
        </div>
        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "噪声水平" : "Noise level"}</div>
          <input type="range" min={0} max={2} step={0.05} value={noise} onChange={e => setNoise(parseFloat(e.target.value))} className="w-full mb-2" />
          <div className="font-mono text-[12px] text-center" style={{ color: "var(--warn)" }}>{noise.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "粒子状态" : "Particle state"}</div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 border rounded-[2px] p-3 text-center" style={{ borderColor: inWellA ? "var(--accent)" : "var(--line)" }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: "var(--accent)" }}>Well A</div>
              <div className="font-mono text-[20px]">{timeA}</div>
              <div className="k">{lang === "zh" ? "步" : "steps"}</div>
            </div>
            <div className="flex-1 border rounded-[2px] p-3 text-center" style={{ borderColor: !inWellA ? "var(--tail)" : "var(--line)" }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: "var(--tail)" }}>Well B</div>
              <div className="font-mono text-[20px]">{timeB}</div>
              <div className="k">{lang === "zh" ? "步" : "steps"}</div>
            </div>
          </div>
          <div className="text-[12px] text-[var(--ink-dim)] font-mono mb-1">
            {lang === "zh" ? "当前位置" : "Current x"}: <span style={{ color: "var(--warn)" }}>{particleX.toFixed(3)}</span>
          </div>
          <div className="text-[12px] text-[var(--ink-dim)] font-mono">
            {lang === "zh" ? "当前势能" : "V(x)"}: <span style={{ color: "var(--baseline)" }}>{potential(particleX, depth, asym).toFixed(3)}</span>
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3">
          <div className="k">{lang === "zh" ? "控制" : "Controls"}</div>
          <button className="btn btn-primary w-full" onClick={simulate}>
            {lang === "zh" ? "▶ 模拟 100 步" : "▶ Simulate 100 steps"}
          </button>
          <button className="btn w-full" onClick={perturbAndSimulate}>
            {lang === "zh" ? "⚡ 扰动粒子" : "⚡ Perturbation kick"}
          </button>
          <p className="text-[12px] text-[var(--ink-soft)] leading-[1.6]">
            {lang === "zh"
              ? "扰动使粒子跳出当前阱。高噪声 + 浅阱 = 更频繁的盆地切换（亚稳态）。"
              : "Perturbation kicks the particle out of its current well. High noise + shallow well = more frequent basin-switching (metastability)."}
          </p>
        </div>
      </div>

      <div className="card p-5 border-l-2 border-[var(--baseline)]">
        <p className="text-[13px] text-[var(--ink-soft)] leading-[1.75]">
          {lang === "zh"
            ? "系统的长期行为由哪个吸引子盆地主导。越深的阱越稳定。不对称性使一个阱比另一个更受青睐。足够的噪声可以触发盆地间的跃迁——这称为克拉默斯过渡。"
            : "A system's long-term behavior is defined by which attractor basin dominates. Deeper wells are more stable. Asymmetry makes one well more favored. Sufficient noise can trigger inter-basin transitions — called Kramers transitions."}
        </p>
      </div>
    </div>
  );
}
