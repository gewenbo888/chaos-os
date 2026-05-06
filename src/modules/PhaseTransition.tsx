"use client";
import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LangProvider";

const N = 40; // spins
const METRO_STEPS = 200;
const TC = 2.27; // approximate critical temperature

function metropolis(spins: number[], T: number, steps: number): number[] {
  const s = [...spins];
  for (let step = 0; step < steps; step++) {
    const i = Math.floor(Math.random() * N);
    const left = s[(i - 1 + N) % N];
    const right = s[(i + 1) % N];
    const dE = 2 * s[i] * (left + right);
    if (dE < 0 || Math.random() < Math.exp(-dE / T)) {
      s[i] = -s[i];
    }
  }
  return s;
}

function magnetization(spins: number[]): number {
  return Math.abs(spins.reduce((a, b) => a + b, 0) / N);
}

function susceptibility(spins: number[], T: number): number {
  const m = spins.reduce((a, b) => a + b, 0) / N;
  const m2 = spins.reduce((a, b) => a + b * b, 0) / N;
  return Math.abs((m2 - m * m) * N / Math.max(T, 0.1));
}

// Precompute M vs T curve
const T_RANGE = Array.from({ length: 40 }, (_, i) => 0.2 + i * 0.12);

export function PhaseTransition() {
  const { lang } = useLang();
  const [T, setT] = useState(1.5);

  const initSpins = useMemo(() => Array.from({ length: N }, () => (Math.random() > 0.5 ? 1 : -1)), []);

  const spins = useMemo(() => {
    const s = initSpins.map(v => (T < TC ? Math.abs(v) : v)); // start ordered for low T
    return metropolis(s, T, METRO_STEPS);
  }, [T, initSpins]);

  const M = magnetization(spins);
  const chi = susceptibility(spins, T);

  const mCurve = useMemo(() =>
    T_RANGE.map(t => {
      const s0 = Array.from({ length: N }, () => (t < TC ? 1 : (Math.random() > 0.5 ? 1 : -1)));
      const sf = metropolis(s0, t, METRO_STEPS);
      return { t, m: magnetization(sf) };
    }),
    []
  );

  // Chart dimensions
  const W = 420;
  const H = 110;
  const PAD = { l: 32, r: 12, t: 8, b: 24 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const tMin = T_RANGE[0];
  const tMax = T_RANGE[T_RANGE.length - 1];

  const curvePath = mCurve.map(({ t, m }, i) => {
    const px = PAD.l + ((t - tMin) / (tMax - tMin)) * plotW;
    const py = PAD.t + plotH - m * plotH;
    return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");

  const tcX = PAD.l + ((TC - tMin) / (tMax - tMin)) * plotW;
  const currentX = PAD.l + ((T - tMin) / (tMax - tMin)) * plotW;

  const CELL = 11;
  const spinSVG_W = N * CELL + 2;
  const spinSVG_H = CELL + 2;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="k mb-1">{lang === "zh" ? "1D Ising 模型 · 40 自旋" : "1D Ising model · 40 spins"}</div>
        <h3 className="text-[18px] font-medium mb-4">
          {lang === "zh" ? "相变：秩序在临界点急剧崩塌" : "Phase transition: order collapses sharply at the critical point"}
        </h3>

        <div className="mb-4">
          <div className="k mb-2">{lang === "zh" ? "自旋阵列（绿=向上，暗=向下）" : "Spin array (mint=up, dark=down)"}</div>
          <svg width={spinSVG_W} height={spinSVG_H}>
            {spins.map((s, i) => (
              <rect
                key={i}
                x={i * CELL + 1}
                y={1}
                width={CELL - 2}
                height={CELL - 2}
                fill={s === 1 ? "var(--accent)" : "var(--bg-elev-2)"}
                stroke="var(--line)"
                strokeWidth="0.5"
                rx="1"
              />
            ))}
          </svg>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="border border-[var(--line)] rounded-[2px] p-3">
            <div className="k mb-1">{lang === "zh" ? "磁化强度 M" : "Magnetization M"}</div>
            <div className="font-mono text-[22px]" style={{ color: M > 0.5 ? "var(--accent)" : "var(--ink-dim)" }}>{M.toFixed(3)}</div>
          </div>
          <div className="border border-[var(--line)] rounded-[2px] p-3">
            <div className="k mb-1">{lang === "zh" ? "磁化率 χ" : "Susceptibility χ"}</div>
            <div className="font-mono text-[22px]" style={{ color: "var(--baseline)" }}>{chi.toFixed(2)}</div>
          </div>
          <div className="border border-[var(--line)] rounded-[2px] p-3">
            <div className="k mb-1">{lang === "zh" ? "相态" : "Phase"}</div>
            <div className="font-mono text-[16px]" style={{ color: T < TC ? "var(--accent)" : "var(--bad)" }}>
              {T < TC ? (lang === "zh" ? "有序相" : "Ordered") : (lang === "zh" ? "无序相" : "Disordered")}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="k mb-2">{lang === "zh" ? "温度控制 T" : "Temperature T"}</div>
          <input
            type="range"
            min={0.1}
            max={5.0}
            step={0.05}
            value={T}
            onChange={e => setT(parseFloat(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex justify-between font-mono text-[11px] text-[var(--ink-dim)]">
            <span>0.1</span>
            <span style={{ color: Math.abs(T - TC) < 0.3 ? "var(--warn)" : "var(--accent)" }}>
              T={T.toFixed(2)} {Math.abs(T - TC) < 0.3 ? (lang === "zh" ? "≈ Tc!" : "≈ Tc!") : ""}
            </span>
            <span>5.0</span>
          </div>
          <p className="text-[12px] text-[var(--ink-soft)] mt-3 leading-[1.6]">
            {lang === "zh"
              ? `临界温度 Tc ≈ ${TC}。在此处，序参量 M 急剧下降，涨落发散。`
              : `Critical temperature Tc ≈ ${TC}. Here the order parameter M drops sharply and fluctuations diverge.`}
          </p>
        </div>

        <div className="card p-5">
          <div className="k mb-2">{lang === "zh" ? "M 对 T 曲线（序参量）" : "M vs T curve (order parameter)"}</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <line x1={PAD.l} y1={PAD.t + plotH} x2={PAD.l + plotW} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
            {/* Tc line */}
            <line x1={tcX} y1={PAD.t} x2={tcX} y2={PAD.t + plotH} stroke="var(--warn)" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
            <text x={tcX + 3} y={PAD.t + 10} fill="var(--warn)" fontSize="8" fontFamily="monospace">Tc</text>
            {/* M curve */}
            <path d={curvePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
            {/* Current T indicator */}
            <line x1={currentX} y1={PAD.t} x2={currentX} y2={PAD.t + plotH} stroke="var(--baseline)" strokeWidth="1" opacity="0.8" />
            {/* axes */}
            <text x={PAD.l - 4} y={PAD.t + 4} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">1</text>
            <text x={PAD.l - 4} y={PAD.t + plotH} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">0</text>
            <text x={PAD.l} y={PAD.t + plotH + 16} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace">T=0.2</text>
            <text x={PAD.l + plotW} y={PAD.t + plotH + 16} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">T=5</text>
          </svg>
          <div className="flex gap-4 text-[12px] mt-2">
            <div className="flex items-center gap-2"><div className="w-4 h-[2px]" style={{ background: "var(--accent)" }} /><span className="text-[var(--ink-soft)]">M(T)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-[1px] border-t border-dashed" style={{ borderColor: "var(--warn)" }} /><span className="text-[var(--ink-soft)]">Tc</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-[1px]" style={{ background: "var(--baseline)" }} /><span className="text-[var(--ink-soft)]">{lang === "zh" ? "当前 T" : "Current T"}</span></div>
          </div>
        </div>
      </div>

      <div className="card p-5 border-l-2 border-[var(--warn)]">
        <p className="text-[13px] text-[var(--ink-soft)] leading-[1.75]">
          {lang === "zh"
            ? "相变看似突然，但它们有前兆：在临界温度附近，系统响应速度（磁化率χ）发散。这种「临界慢化」在气候倾覆、金融危机和生态崩溃中均有出现。"
            : "Phase transitions appear sudden, but they have precursors: near the critical temperature, the system's response speed (susceptibility χ) diverges. This 'critical slowing down' appears in climate tipping points, financial crises, and ecological collapses."}
        </p>
      </div>
    </div>
  );
}
