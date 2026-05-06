"use client";
import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LangProvider";

type FeedbackSystem = {
  id: string;
  name: { en: string; zh: string };
  desc: { en: string; zh: string };
  param: { en: string; zh: string };
  paramMin: number;
  paramMax: number;
  paramDefault: number;
  paramStep: number;
  loops: { from: string; to: string; sign: "+" | "−" }[];
  nodes: { id: string; label: string; x: number; y: number }[];
  simulate: (param: number) => number[];
};

const SYSTEMS: FeedbackSystem[] = [
  {
    id: "logistic",
    name: { en: "Population Growth", zh: "种群增长" },
    desc: { en: "Logistic growth: positive feedback (reproduction) checked by negative feedback (carrying capacity).", zh: "逻辑斯蒂增长：正反馈（繁殖）受负反馈（环境容量）制约。" },
    param: { en: "Growth rate r", zh: "增长率 r" },
    paramMin: 0.1, paramMax: 0.9, paramDefault: 0.4, paramStep: 0.05,
    nodes: [
      { id: "pop", label: "Population", x: 100, y: 50 },
      { id: "birth", label: "Births", x: 220, y: 20 },
      { id: "cap", label: "Capacity", x: 220, y: 80 },
    ],
    loops: [
      { from: "pop", to: "birth", sign: "+" },
      { from: "birth", to: "pop", sign: "+" },
      { from: "pop", to: "cap", sign: "+" },
      { from: "cap", to: "pop", sign: "−" },
    ],
    simulate: (r) => {
      let p = 0.05;
      return Array.from({ length: 60 }, () => { p = p + r * p * (1 - p); return Math.max(0, Math.min(1, p)); });
    },
  },
  {
    id: "diffusion",
    name: { en: "Innovation Diffusion", zh: "创新扩散" },
    desc: { en: "S-curve adoption: positive feedback from social proof saturates when most have adopted.", zh: "S形采用曲线：社会认同的正反馈在大多数人采用后趋于饱和。" },
    param: { en: "Contact rate β", zh: "接触率 β" },
    paramMin: 0.01, paramMax: 0.2, paramDefault: 0.08, paramStep: 0.01,
    nodes: [
      { id: "adopters", label: "Adopters", x: 80, y: 50 },
      { id: "contact", label: "Contact", x: 200, y: 30 },
      { id: "potential", label: "Potential", x: 200, y: 70 },
    ],
    loops: [
      { from: "adopters", to: "contact", sign: "+" },
      { from: "contact", to: "potential", sign: "+" },
      { from: "potential", to: "adopters", sign: "+" },
      { from: "adopters", to: "potential", sign: "−" },
    ],
    simulate: (b) => {
      let a = 0.01;
      return Array.from({ length: 60 }, () => { a = a + b * a * (1 - a); return Math.min(1, a); });
    },
  },
  {
    id: "pricedemand",
    name: { en: "Price–Demand", zh: "价格–需求" },
    desc: { en: "Negative feedback loop: price rises → demand falls → price stabilizes.", zh: "负反馈环路：价格上涨 → 需求下降 → 价格稳定。" },
    param: { en: "Demand elasticity α", zh: "需求弹性 α" },
    paramMin: 0.05, paramMax: 0.6, paramDefault: 0.2, paramStep: 0.05,
    nodes: [
      { id: "price", label: "Price", x: 80, y: 50 },
      { id: "demand", label: "Demand", x: 220, y: 50 },
    ],
    loops: [
      { from: "price", to: "demand", sign: "−" },
      { from: "demand", to: "price", sign: "+" },
    ],
    simulate: (a) => {
      let price = 1.5;
      return Array.from({ length: 60 }, () => {
        const demand = 1 / (1 + a * price);
        price = price + 0.1 * (demand - 0.5);
        return Math.max(0, price);
      });
    },
  },
  {
    id: "socialproof",
    name: { en: "Social Proof", zh: "社会认同" },
    desc: { en: "Positive cascade: belief → behavior → visibility → more belief. Can runaway to extremes.", zh: "正向级联：信念 → 行为 → 可见性 → 更多信念。可能失控至极端。" },
    param: { en: "Amplification k", zh: "放大系数 k" },
    paramMin: 0.5, paramMax: 3.0, paramDefault: 1.5, paramStep: 0.1,
    nodes: [
      { id: "belief", label: "Belief", x: 60, y: 50 },
      { id: "behavior", label: "Behavior", x: 180, y: 20 },
      { id: "visibility", label: "Visibility", x: 180, y: 80 },
    ],
    loops: [
      { from: "belief", to: "behavior", sign: "+" },
      { from: "behavior", to: "visibility", sign: "+" },
      { from: "visibility", to: "belief", sign: "+" },
    ],
    simulate: (k) => {
      let b = 0.1;
      return Array.from({ length: 60 }, () => {
        b = Math.min(1, b * (1 + 0.04 * k * (1 - b)));
        return b;
      });
    },
  },
  {
    id: "immune",
    name: { en: "Immune Response", zh: "免疫响应" },
    desc: { en: "Oscillating feedback: pathogen triggers immune response that overshoots then undershoots.", zh: "振荡反馈：病原体触发免疫响应，先过冲后不足，形成振荡。" },
    param: { en: "Response strength γ", zh: "响应强度 γ" },
    paramMin: 0.1, paramMax: 1.5, paramDefault: 0.6, paramStep: 0.05,
    nodes: [
      { id: "pathogen", label: "Pathogen", x: 80, y: 40 },
      { id: "immune", label: "Immune", x: 220, y: 40 },
      { id: "cytokines", label: "Cytokines", x: 150, y: 90 },
    ],
    loops: [
      { from: "pathogen", to: "immune", sign: "+" },
      { from: "immune", to: "cytokines", sign: "+" },
      { from: "cytokines", to: "pathogen", sign: "−" },
      { from: "cytokines", to: "immune", sign: "+" },
    ],
    simulate: (g) => {
      let p = 1.0, im = 0.1;
      return Array.from({ length: 60 }, () => {
        const dp = 0.05 * p - g * im * p;
        const dim = 0.1 * p - 0.08 * im;
        p = Math.max(0, p + dp);
        im = Math.max(0, im + dim);
        return Math.min(2, p);
      });
    },
  },
];

export function FeedbackMapper() {
  const { lang } = useLang();
  const [selectedId, setSelectedId] = useState("logistic");
  const [param, setParam] = useState<Record<string, number>>({
    logistic: 0.4, diffusion: 0.08, pricedemand: 0.2, socialproof: 1.5, immune: 0.6,
  });
  const [logScale, setLogScale] = useState(false);

  const sys = SYSTEMS.find(s => s.id === selectedId)!;
  const series = useMemo(() => sys.simulate(param[sys.id]), [sys, param]);

  const W = 420;
  const H = 120;
  const PAD = { l: 32, r: 12, t: 8, b: 20 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const rawMin = Math.min(...series);
  const rawMax = Math.max(...series);
  const transform = (v: number) => logScale ? Math.log1p(Math.max(0, v)) : v;
  const tSeries = series.map(transform);
  const tMin = Math.min(...tSeries);
  const tMax = Math.max(...tSeries);
  const tRange = tMax - tMin || 1;

  const chartPath = series.map((_, i) => {
    const tv = transform(series[i]);
    const px = PAD.l + (i / (series.length - 1)) * plotW;
    const py = PAD.t + plotH - ((tv - tMin) / tRange) * plotH;
    return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");

  // Loop diagram SVG
  const LW = 300;
  const LH = 110;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="k mb-3">{lang === "zh" ? "反馈系统选择器" : "Feedback system selector"}</div>
        <div className="flex flex-wrap gap-2">
          {SYSTEMS.map(s => (
            <button
              key={s.id}
              className={`btn !py-1.5 !px-3 font-mono text-[11px] uppercase tracking-[0.12em] ${selectedId === s.id ? "btn-primary" : ""}`}
              onClick={() => setSelectedId(s.id)}>
              {s.name[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="k mb-2">{lang === "zh" ? "环路图" : "Loop diagram"}</div>
          <svg width="100%" viewBox={`0 0 ${LW} ${LH}`} className="overflow-visible">
            {sys.nodes.map(n => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="20" fill="var(--bg-elev-2)" stroke="var(--accent)" strokeWidth="1" />
                <text x={n.x} y={n.y + 4} fill="var(--ink)" fontSize="8" fontFamily="monospace" textAnchor="middle">{n.label}</text>
              </g>
            ))}
            {sys.loops.map((l, i) => {
              const from = sys.nodes.find(n => n.id === l.from)!;
              const to = sys.nodes.find(n => n.id === l.to)!;
              const midX = (from.x + to.x) / 2 + (i % 2 === 0 ? 10 : -10);
              const midY = (from.y + to.y) / 2 + (i % 2 === 0 ? -12 : 12);
              return (
                <g key={i}>
                  <path
                    d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                    fill="none"
                    stroke={l.sign === "+" ? "var(--accent)" : "var(--bad)"}
                    strokeWidth="1.5"
                    markerEnd={`url(#arrow-${l.sign === "+" ? "pos" : "neg"})`}
                  />
                  <text x={midX} y={midY - 4} fill={l.sign === "+" ? "var(--accent)" : "var(--bad)"} fontSize="11" fontFamily="monospace" textAnchor="middle">{l.sign}</text>
                </g>
              );
            })}
            <defs>
              <marker id="arrow-pos" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="var(--accent)" />
              </marker>
              <marker id="arrow-neg" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="var(--bad)" />
              </marker>
            </defs>
          </svg>
          <p className="text-[12px] text-[var(--ink-soft)] mt-2 leading-[1.6]">{sys.desc[lang]}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="k">{lang === "zh" ? "时间序列" : "Time series"}</div>
            <button
              className={`btn !py-1 !px-2 font-mono text-[10px] ${logScale ? "btn-primary" : ""}`}
              onClick={() => setLogScale(l => !l)}>
              {logScale ? "LOG" : "LIN"}
            </button>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible mb-2">
            <line x1={PAD.l} y1={PAD.t + plotH} x2={PAD.l + plotW} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + plotH} stroke="var(--line)" strokeWidth="1" />
            <path d={chartPath} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <text x={PAD.l - 2} y={PAD.t + plotH + 14} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="middle">0</text>
            <text x={PAD.l + plotW} y={PAD.t + plotH + 14} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="middle">60</text>
            <text x={PAD.l - 4} y={PAD.t + 4} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">{rawMax.toFixed(2)}</text>
            <text x={PAD.l - 4} y={PAD.t + plotH} fill="var(--ink-dim)" fontSize="9" fontFamily="monospace" textAnchor="end">{rawMin.toFixed(2)}</text>
          </svg>
          <div className="mt-3">
            <div className="k mb-2">{sys.param[lang]}</div>
            <input
              type="range"
              min={sys.paramMin}
              max={sys.paramMax}
              step={sys.paramStep}
              value={param[sys.id]}
              onChange={e => setParam(p => ({ ...p, [sys.id]: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between font-mono text-[11px] text-[var(--ink-dim)] mt-1">
              <span>{sys.paramMin}</span>
              <span style={{ color: "var(--accent)" }}>{param[sys.id]}</span>
              <span>{sys.paramMax}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
