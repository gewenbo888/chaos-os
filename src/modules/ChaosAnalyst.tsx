"use client";
import { useState } from "react";
import { useLang } from "@/i18n/LangProvider";

type Finding = {
  id: string;
  severity: "critical" | "warning" | "insight" | "safe";
  module: { en: string; zh: string };
  title: { en: string; zh: string };
  body: { en: string; zh: string };
  action: { en: string; zh: string };
};

const FINDINGS: Finding[] = [
  {
    id: "c1",
    severity: "critical",
    module: { en: "Butterfly Effect", zh: "蝴蝶效应" },
    title: { en: "Long-term prediction is structurally impossible", zh: "长期预测在结构上是不可能的" },
    body: {
      en: "Sensitive dependence on initial conditions means that even arbitrarily small measurement errors grow exponentially. For the Lorenz system, divergence typically occurs within 20–50 time steps regardless of ε. This is not a technical limitation — it is a fundamental property of nonlinear systems.",
      zh: "对初始条件的敏感依赖意味着即使是任意小的测量误差也会指数级增长。对于洛伦兹系统，无论ε多小，发散通常在20-50个时间步内发生。这不是技术限制——这是非线性系统的基本性质。",
    },
    action: {
      en: "Stop optimizing point predictions. Instead, map the attractor structure: what states does the system visit? What are the boundaries between basins? Plan for the distribution of outcomes, not a single forecast.",
      zh: "停止优化点预测。转而绘制吸引子结构：系统会访问哪些状态？盆地之间的边界在哪里？为结果的分布而规划，而非单一预测。",
    },
  },
  {
    id: "c2",
    severity: "critical",
    module: { en: "Attractors", zh: "吸引子" },
    title: { en: "System identity is defined by attractor basin, not instantaneous state", zh: "系统身份由吸引子盆地定义，而非瞬时状态" },
    body: {
      en: "A system in well A and a system in well B can look identical at one moment but will diverge in the long run. Interventions that do not change which basin the system occupies are cosmetic. Metastability means the current state is not predictive of the attractor — only basin depth and noise level determine residence time.",
      zh: "处于阱A中的系统和处于阱B中的系统在某一时刻可能看起来完全相同，但从长远来看会发散。不改变系统所在盆地的干预是表面的。亚稳态意味着当前状态无法预测吸引子——只有盆地深度和噪声水平决定停留时间。",
    },
    action: {
      en: "When diagnosing a system, ask: which attractor basin is it in? What would change the basin, not just the current state? Identify the potential energy landscape, not just the particle position.",
      zh: "诊断系统时，问：它在哪个吸引子盆地中？什么会改变盆地，而不仅仅是当前状态？识别势能景观，而非只是粒子位置。",
    },
  },
  {
    id: "c3",
    severity: "insight",
    module: { en: "Emergence", zh: "涌现" },
    title: { en: "Emergence means the macro-level obeys different laws than the micro-level", zh: "涌现意味着宏观层次遵循与微观层次不同的规律" },
    body: {
      en: "Game of Life cells follow three simple rules, yet produce gliders, oscillators, and computationally universal structures. No cell 'knows' it is part of a glider. The emergence is real — you cannot predict the glider trajectory by analyzing individual cells. This is why reductionist explanations systematically fail for complex adaptive systems.",
      zh: "生命游戏的细胞遵循三个简单规则，却产生了滑翔机、振荡器和计算上通用的结构。没有细胞「知道」自己是滑翔机的一部分。涌现是真实的——你无法通过分析单个细胞来预测滑翔机的轨迹。这就是为什么还原论解释对复杂自适应系统系统性地失败。",
    },
    action: {
      en: "When modeling complex systems, work at the level where the relevant patterns emerge — not lower. Identify the 'grain size' where macro-level regularities first appear. Aggregating micro-level data without emergence-level analysis will miss the most important dynamics.",
      zh: "建模复杂系统时，在相关模式涌现的层次工作——而不是更低的层次。识别宏观规律首次出现的「粒度」。没有涌现层次分析的微观数据汇总将错过最重要的动态。",
    },
  },
  {
    id: "c4",
    severity: "warning",
    module: { en: "Feedback", zh: "反馈" },
    title: { en: "Positive feedback loops are the engine of both innovation and collapse", zh: "正反馈环路是创新与崩溃的共同引擎" },
    body: {
      en: "Social proof, innovation diffusion, and population growth all share the same mathematical structure: dx/dt ∝ x. The same loop that drives exponential growth drives exponential collapse. Positive feedback has no 'direction' preference — it amplifies whatever state the system is in. Systems dominated by positive feedback are inherently fragile.",
      zh: "社会认同、创新扩散和种群增长都共享相同的数学结构：dx/dt ∝ x。驱动指数增长的同一环路驱动指数崩溃。正反馈没有「方向」偏好——它放大系统所处的任何状态。被正反馈主导的系统本质上是脆弱的。",
    },
    action: {
      en: "For any positive feedback loop you identify, ask: what is the stabilizing negative feedback? If none exists in the natural system, design one. Innovation ecosystems, financial systems, and social networks all require deliberate negative feedback mechanisms to prevent runaway dynamics.",
      zh: "对于你识别的任何正反馈环路，问：稳定的负反馈是什么？如果自然系统中不存在，就设计一个。创新生态系统、金融系统和社交网络都需要刻意设计的负反馈机制来防止失控动态。",
    },
  },
  {
    id: "c5",
    severity: "insight",
    module: { en: "Phase Transition", zh: "相变" },
    title: { en: "Phase transitions appear sudden but are preceded by critical slowing down", zh: "相变看似突然，但之前有临界慢化的前兆" },
    body: {
      en: "Near the critical temperature, susceptibility χ diverges — the system responds more and more dramatically to small perturbations. This is an early warning signal. The same pattern appears before tipping points in climate systems (loss of ice-albedo feedback), ecosystems (predator-prey collapse), and financial markets (volatility clustering before crashes).",
      zh: "在临界温度附近，磁化率χ发散——系统对小扰动的响应越来越剧烈。这是预警信号。同样的模式出现在气候系统临界点之前（冰雪-反照率反馈损失）、生态系统（捕食者-猎物崩溃）和金融市场（崩溃前的波动聚集）。",
    },
    action: {
      en: "Monitor susceptibility indicators, not just the order parameter. In real systems: increasing autocorrelation, increasing variance, and slowing recovery from perturbations are critical slowing down signatures. These appear before the transition, not after.",
      zh: "监测磁化率指标，而不仅仅是序参量。在实际系统中：增加的自相关、增加的方差和从扰动中恢复速度的减慢是临界慢化的特征。这些在过渡之前出现，而不是之后。",
    },
  },
  {
    id: "c6",
    severity: "safe",
    module: { en: "Cross-module", zh: "跨模块" },
    title: { en: "Navigating attractors is more robust than eliminating sensitivity", zh: "导航吸引子比消除敏感性更稳健" },
    body: {
      en: "The Lorenz butterfly cannot be eliminated — it is intrinsic to the system. But the attractor structure is stable: the system always returns to the same strange attractor region even when perturbed. Robust strategies exploit attractor structure: identify which basin is preferable, understand the potential landscape, and design perturbations that push toward the preferred basin rather than trying to predict the trajectory within it.",
      zh: "洛伦兹蝴蝶无法消除——它是系统固有的。但吸引子结构是稳定的：系统即使受到扰动，也总是返回相同的奇异吸引子区域。稳健策略利用吸引子结构：识别哪个盆地更可取，理解势能景观，并设计将系统推向首选盆地的扰动，而不是试图预测其内部的轨迹。",
    },
    action: {
      en: "The robust operating principle for complex systems: (1) map the attractor landscape, (2) identify which attractors are preferred vs. dangerous, (3) maintain sufficient distance from dangerous basin boundaries, (4) design interventions that shift basins rather than point-predicting trajectories. Sensitivity is a feature, not a bug — it enables rapid adaptation.",
      zh: "复杂系统的稳健操作原则：(1) 绘制吸引子景观，(2) 识别哪些吸引子是优选的还是危险的，(3) 与危险的盆地边界保持足够距离，(4) 设计改变盆地而非点预测轨迹的干预措施。敏感性是特性，而非缺陷——它使快速适应成为可能。",
    },
  },
];

const SEV_CONFIG = {
  critical: { label: { en: "CRITICAL", zh: "严重" }, color: "var(--bad)", bg: "rgba(255,79,107,0.08)" },
  warning:  { label: { en: "WARNING",  zh: "警告" }, color: "var(--warn)", bg: "rgba(255,207,86,0.08)" },
  insight:  { label: { en: "INSIGHT",  zh: "洞见" }, color: "var(--accent)", bg: "rgba(124,255,203,0.06)" },
  safe:     { label: { en: "ROBUST",   zh: "稳健" }, color: "var(--good)", bg: "rgba(124,255,203,0.06)" },
};

export function ChaosAnalyst() {
  const { lang, B } = useLang();
  const [expanded, setExpanded] = useState<string | null>("c1");
  const [filter, setFilter] = useState<"all" | Finding["severity"]>("all");

  const critCount = FINDINGS.filter(f => f.severity === "critical").length;
  const warnCount = FINDINGS.filter(f => f.severity === "warning").length;
  const insightCount = FINDINGS.filter(f => f.severity === "insight").length;
  const safeCount = FINDINGS.filter(f => f.severity === "safe").length;

  const visible = filter === "all" ? FINDINGS : FINDINGS.filter(f => f.severity === filter);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="card p-6" style={{ borderColor: "var(--bad)" }}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="k mb-2">{lang === "zh" ? "混沌分析师综合评估" : "Chaos analyst synthesis"}</div>
            <h2 className="text-[20px] font-medium mb-2" style={{ color: "var(--bad)" }}>
              {lang === "zh"
                ? `发现 ${critCount} 项严重，${warnCount} 项警告，${insightCount} 项洞见，${safeCount} 项稳健`
                : `${critCount} critical · ${warnCount} warnings · ${insightCount} insights · ${safeCount} robust`}
            </h2>
            <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed max-w-[580px]">
              {lang === "zh"
                ? "本分析综合五个模块的输出。严重项表示需要在做出确定性预测或干预之前解决的结构性问题。"
                : "This analysis synthesizes outputs across all five modules. Critical findings indicate structural properties that must be understood before making deterministic predictions or interventions."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {(["all", "critical", "warning", "insight"] as const).map(s => (
              <button key={s}
                onClick={() => setFilter(f => f === s ? "all" : s)}
                className={`px-3 py-2 border text-[11px] font-mono uppercase tracking-[0.15em] transition-all rounded-[2px]
                  ${filter === s ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--ink-dim)]"}`}>
                {s === "all"
                  ? (lang === "zh" ? `全部 ${FINDINGS.length}` : `All ${FINDINGS.length}`)
                  : s === "critical" ? (lang === "zh" ? `严重 ${critCount}` : `Critical ${critCount}`)
                  : s === "warning"  ? (lang === "zh" ? `警告 ${warnCount}`  : `Warning ${warnCount}`)
                  : (lang === "zh" ? `洞见 ${insightCount}` : `Insight ${insightCount}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Finding cards */}
      <div className="space-y-3">
        {visible.map(f => {
          const sev = SEV_CONFIG[f.severity];
          const isOpen = expanded === f.id;
          return (
            <div key={f.id} className="card overflow-hidden" style={{ background: isOpen ? sev.bg : undefined }}>
              <button
                className="w-full p-5 text-left flex items-start gap-4"
                onClick={() => setExpanded(isOpen ? null : f.id)}>
                <div className="shrink-0 mt-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border"
                    style={{ color: sev.color, borderColor: sev.color, background: sev.bg }}>
                    {sev.label[lang]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-dim)]">{B(f.module)}</span>
                  </div>
                  <div className="text-[14px] font-medium">{B(f.title)}</div>
                </div>
                <span className="text-[var(--ink-dim)] font-mono text-[14px] shrink-0 mt-0.5">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-[var(--line)]">
                  <div className="pt-4 grid md:grid-cols-2 gap-5">
                    <div>
                      <div className="k mb-2">{lang === "zh" ? "分析" : "Analysis"}</div>
                      <p className="text-[13px] text-[var(--ink-soft)] leading-[1.75]">{B(f.body)}</p>
                    </div>
                    <div className="border-l border-[var(--line)] pl-5">
                      <div className="k mb-2" style={{ color: sev.color }}>{lang === "zh" ? "推荐行动" : "Recommended action"}</div>
                      <p className="text-[13px] text-[var(--ink)] leading-[1.75]">{B(f.action)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Framework card */}
      <div className="card p-6">
        <div className="k mb-4">{lang === "zh" ? "混沌系统分析框架" : "Chaos systems analysis framework"}</div>
        <div className="grid md:grid-cols-3 gap-6 text-[13px]">
          {[
            {
              step: "01",
              title: { en: "Map the attractor landscape", zh: "绘制吸引子景观" },
              body: { en: "Before any intervention: what attractors exist? What are the basin boundaries? Which states are stable vs. metastable? Point-state analysis always misleads.", zh: "在任何干预之前：存在哪些吸引子？盆地边界在哪里？哪些状态是稳定的还是亚稳态的？点状态分析总是误导性的。" },
            },
            {
              step: "02",
              title: { en: "Identify the feedback structure", zh: "识别反馈结构" },
              body: { en: "Positive feedback amplifies (growth and collapse). Negative feedback stabilizes (oscillation and equilibrium). Every unexpected system behavior is an unmapped feedback loop.", zh: "正反馈放大（增长和崩溃）。负反馈稳定（振荡和均衡）。每一个意外的系统行为都是一个未被绘制的反馈环路。" },
            },
            {
              step: "03",
              title: { en: "Monitor emergence, not just components", zh: "监测涌现，而非仅仅是组件" },
              body: { en: "Emergent properties are not predictable from components. Monitor at the level where patterns first appear. Reductionist decomposition alone will systematically miss regime shifts.", zh: "涌现属性无法从组件中预测。在模式首次出现的层次进行监测。单纯的还原论分解将系统性地错过体制转变。" },
            },
          ].map(item => (
            <div key={item.step}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] text-[var(--accent)]">{item.step}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--ink)]">{B(item.title)}</span>
              </div>
              <p className="text-[var(--ink-soft)] leading-[1.65]">{B(item.body)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 border-l-2 border-[var(--tail)]">
          <p className="text-[13px] italic font-serif text-[var(--ink)] leading-[1.75]">
            {lang === "zh"
              ? "混沌分析师的工作不是预测系统的下一个状态。而是确保：你了解吸引子景观的形状；你识别了所有重要的反馈环路；你在正确的层次上观察涌现；在临界点到来之前，你正在监测临界慢化的信号。"
              : "The chaos analyst's job is not to predict the system's next state. It is to ensure: you understand the shape of the attractor landscape; you have identified all important feedback loops; you are observing emergence at the correct level; and you are monitoring critical slowing down signals before tipping points arrive."}
          </p>
        </div>
      </div>
    </div>
  );
}
