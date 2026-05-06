"use client";
import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LangProvider";

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.01;
const STEPS = 200;

function lorenzStep(x: number, y: number, z: number) {
  const dx = SIGMA * (y - x);
  const dy = x * (RHO - z) - y;
  const dz = x * y - BETA * z;
  return {
    x: x + dx * DT,
    y: y + dy * DT,
    z: z + dz * DT,
  };
}

function simulate(eps: number) {
  const xs1: number[] = [];
  const xs2: number[] = [];
  let s1 = { x: 1, y: 1, z: 1 };
  let s2 = { x: 1 + eps, y: 1, z: 1 };
  for (let i = 0; i < STEPS; i++) {
    xs1.push(s1.x);
    xs2.push(s2.x);
    s1 = lorenzStep(s1.x, s1.y, s1.z);
    s2 = lorenzStep(s2.x, s2.y, s2.z);
  }
  return { xs1, xs2 };
}

function divergenceTime(xs1: number[], xs2: number[]) {
  for (let i = 0; i < xs1.length; i++) {
    if (Math.abs(xs1[i] - xs2[i]) > 1.0) return i;
  }
  return xs1.length;
}

export function ButterflyEffect() {
  const { lang } = useLang();
  const [eps, setEps] = useState(0.01);

  const { xs1, xs2 } = useMemo(() => simulate(eps), [eps]);
  const divT = useMemo(() => divergenceTime(xs1, xs2), [xs1, xs2]);

  const W = 560;
  const H = 160;
  const PAD = { l: 32, r: 12, t: 10, b: 24 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const allX = [...xs1, ...xs2];
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const rangeX = maxX - minX || 1;

  function toSVG(arr: number[]) {
    return arr
      .map((v, i) => {
        const px = PAD.l + (i / (STEPS - 1)) * plotW;
        const py = PAD.t + plotH - ((v - minX) / rangeX) * plotH;
        return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
}

  const divX = PAD.l + (Math.min(divT, STEPS - 1) / (STEPS - 1)) * plotW;

  const chaosBar = Math.min(100, (1 - divT / STEPS) * 100 + (Math.log10(Math.max(eps, 0.0001) + 1) * 60));

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
          <div>
            <div className="k mb-1">{lang === "zh" ? "洛伦兹系统 · 两条轨迹" : "Lorenz system · two trajectories"}</div>
            <h3 className="text-[18px] font-medium">
              {lang === "zh" ? "初始条件的敏感依赖性" : "Sensitive dependence on initial conditions"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="k mb-1">{lang === "zh" ? "发散时步" : "Divergence step"}</div>
            <div className="font-mono text-[24px]" style={{ color: divT < STEPS ? "var(--bad)" : "var(--good)" }}>
              {divT < STEPS ? `t=${divT}` : lang === "zh" ? "未发散" : "No div."}
            </div>
          </div>
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          {/* axes */}
          <line x1={PAD.l} y1={PAD.t + plotH} x2={PAD.l + plotW} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
          {/* divergence marker */}
          {divT < STEPS && (
            <line x1={divX} y1={PAD.t} x2={divX} y2={PAD.t + plotH} stroke="var(--bad)" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
          )}
          {/* trajectory 1 */}
          <path d={toSVG(xs1)} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          {/* trajectory 2 */}
          <path d={toSVG(xs2)} fill="none" stroke="var(--baseline)" strokeWidth="1" opacity="0.75" />
          {/* axis labels */}
          <text x={PAD.l - 4} y={PAD.t + plotH + 14} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="middle">0</text>
          <text x={PAD.l + plotW} y={PAD.t + plotH + 14} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="middle">{STEPS}</text>
          <text x={PAD.l - 4} y={PAD.t + 4} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">x</text>
        </svg>

        <div className="flex gap-6 mt-3 text-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2px]" style={{ background: "var(--accent)" }} />
            <span className="text-[var(--ink-soft)]">{lang === "zh" ? "轨迹 1 (x₀=1)" : "Traj. 1 (x₀=1)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[1px]" style={{ background: "var(--baseline)" }} />
            <span className="text-[var(--ink-soft)]">{lang === "zh" ? `轨迹 2 (x₀=1+ε, ε=${eps.toFixed(4)})` : `Traj. 2 (x₀=1+ε, ε=${eps.toFixed(4)})`}</span>
          </div>
          {divT < STEPS && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-[1px]" style={{ background: "var(--bad)" }} />
              <span className="text-[var(--ink-soft)]">{lang === "zh" ? "发散点" : "Divergence"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "初始偏差 ε" : "Initial offset ε"}</div>
          <input
            type="range"
            min={0.0001}
            max={0.5}
            step={0.0001}
            value={eps}
            onChange={e => setEps(parseFloat(e.target.value))}
            className="w-full mb-3"
          />
          <div className="flex justify-between font-mono text-[11px] text-[var(--ink-dim)]">
            <span>0.0001</span>
            <span style={{ color: "var(--accent)" }}>{eps.toFixed(4)}</span>
            <span>0.5</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="k mb-3">{lang === "zh" ? "混沌指标" : "Chaos indicator"}</div>
          <div className="relative h-4 bg-[var(--bg-elev-2)] rounded-[2px] overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, chaosBar)}%`, background: "linear-gradient(90deg, var(--accent), var(--bad))" }}
            />
          </div>
          <p className="text-[12px] text-[var(--ink-soft)]">
            {lang === "zh"
              ? `系统在 t=${divT < STEPS ? divT : ">200"} 时发散。σ=10, ρ=28, β=8/3`
              : `System diverges at t=${divT < STEPS ? divT : ">200"}. σ=10, ρ=28, β=8/3`}
          </p>
        </div>
      </div>

      <div className="card p-5 border-l-2 border-[var(--accent)]">
        <p className="text-[13px] text-[var(--ink-soft)] leading-[1.75]">
          {lang === "zh"
            ? "洛伦兹系统由三个耦合的微分方程组成，描述流体对流。微小的初始差异（ε）会以指数级速度增长，使得长期预测不可能——这就是蝴蝶效应。两条轨迹可以共存很长时间，然后突然分叉。"
            : "The Lorenz system consists of three coupled differential equations modeling fluid convection. Tiny initial differences (ε) grow exponentially, making long-term prediction impossible — the butterfly effect. Two trajectories can coexist for long periods then suddenly diverge."}
        </p>
      </div>
    </div>
  );
}
