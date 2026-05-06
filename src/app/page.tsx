"use client";
import { useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/dict";
import { ButterflyEffect } from "@/modules/ButterflyEffect";
import { AttractorBasin } from "@/modules/AttractorBasin";
import { EmergenceEngine } from "@/modules/EmergenceEngine";
import { FeedbackMapper } from "@/modules/FeedbackMapper";
import { PhaseTransition } from "@/modules/PhaseTransition";
import { ChaosAnalyst } from "@/modules/ChaosAnalyst";

type Tab = "overview" | "butterfly" | "attractors" | "emergence" | "feedback" | "phase" | "analyst";

const TABS: { id: Tab; labelKey: keyof typeof ui }[] = [
  { id: "overview",   labelKey: "nav_overview" },
  { id: "butterfly",  labelKey: "nav_butterfly" },
  { id: "attractors", labelKey: "nav_attractors" },
  { id: "emergence",  labelKey: "nav_emergence" },
  { id: "feedback",   labelKey: "nav_feedback" },
  { id: "phase",      labelKey: "nav_phase" },
  { id: "analyst",    labelKey: "nav_analyst" },
];

export default function Home() {
  const { T, lang, toggle } = useLang();
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--line)] bg-[var(--bg)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <button onClick={() => setTab("overview")} className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>∿</span>
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]">
              {T("brand")}
            </span>
          </button>

          <nav className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.15em] whitespace-nowrap transition-all rounded-[2px]
                  ${tab === t.id
                    ? "bg-[var(--bg-elev-2)] text-[var(--accent)] border border-[var(--accent)] border-opacity-40"
                    : "text-[var(--ink-dim)] hover:text-[var(--ink)]"}`}>
                {T(t.labelKey)}
              </button>
            ))}
          </nav>

          <button
            onClick={toggle}
            className="btn !py-1 !px-3 font-mono text-[11px] tracking-[0.15em] shrink-0">
            {lang === "en" ? "中文" : "EN"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10">
        {tab === "overview"   && <Overview onNavigate={setTab} />}
        {tab === "butterfly"  && <Section title={T("nav_butterfly")}  sub={lang === "zh" ? "洛伦兹系统中的敏感依赖性——ε 的微小差异导致完全不同的轨迹" : "Sensitive dependence in the Lorenz system — tiny ε differences yield completely different trajectories"}><ButterflyEffect /></Section>}
        {tab === "attractors" && <Section title={T("nav_attractors")} sub={lang === "zh" ? "双阱势能中的稳定态、盆地切换与亚稳态" : "Stable states, basin-switching, and metastability in the double-well potential"}><AttractorBasin /></Section>}
        {tab === "emergence"  && <Section title={T("nav_emergence")}  sub={lang === "zh" ? "康威生命游戏——三条规则涌现出无限复杂性" : "Conway's Game of Life — three rules emerge infinite complexity"}><EmergenceEngine /></Section>}
        {tab === "feedback"   && <Section title={T("nav_feedback")}   sub={lang === "zh" ? "五种反馈系统的环路图与时间序列——正反馈、负反馈与振荡" : "Loop diagrams and time series of five feedback systems — positive, negative, and oscillating"}><FeedbackMapper /></Section>}
        {tab === "phase"      && <Section title={T("nav_phase")}      sub={lang === "zh" ? "Ising 模型中的相变——秩序参量在临界温度处的急剧崩塌" : "Phase transitions in the Ising model — order parameter collapses sharply at the critical temperature"}><PhaseTransition /></Section>}
        {tab === "analyst"    && <Section title={T("nav_analyst")}    sub={lang === "zh" ? "跨模块综合评估：混沌理论的核心洞见与行动原则" : "Cross-module synthesis: core insights from chaos theory and action principles"}><ChaosAnalyst /></Section>}
      </main>

      <footer className="border-t border-[var(--line)] py-6 text-center text-[11px] font-mono text-[var(--ink-dim)] tracking-[0.12em]">
        {T("footer")}
      </footer>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-medium tracking-tight mb-2">{title}</h1>
        <p className="text-[14px] text-[var(--ink-soft)] font-mono">{sub}</p>
        <div className="divider mt-4" />
      </div>
      {children}
    </div>
  );
}

const MODULE_CARDS: { id: Tab; icon: string; title: { en: string; zh: string }; body: { en: string; zh: string }; accent: string }[] = [
  {
    id: "butterfly",
    icon: "∿",
    title: { en: "Butterfly Effect", zh: "蝴蝶效应" },
    body: { en: "Two Lorenz trajectories starting ε apart. Watch them diverge. See how chaos emerges from deterministic equations.", zh: "两条相差 ε 的洛伦兹轨迹。观察它们如何发散。看混沌如何从确定性方程中涌现。" },
    accent: "var(--accent)",
  },
  {
    id: "attractors",
    icon: "◎",
    title: { en: "Attractor Basins", zh: "吸引子盆地" },
    body: { en: "Double-well potential with two stable attractors. Tune depth, asymmetry, and noise. Observe basin-switching and metastability.", zh: "具有两个稳定吸引子的双阱势能。调节深度、不对称性和噪声。观察盆地切换和亚稳态。" },
    accent: "var(--baseline)",
  },
  {
    id: "emergence",
    icon: "⬡",
    title: { en: "Emergence Engine", zh: "涌现引擎" },
    body: { en: "Conway's Game of Life on a 20×20 grid. Three rules produce gliders, oscillators, and emergent complexity. Click to set initial state.", zh: "20×20 网格上的康威生命游戏。三条规则产生滑翔机、振荡器和涌现的复杂性。点击设置初始状态。" },
    accent: "var(--tail)",
  },
  {
    id: "feedback",
    icon: "⟳",
    title: { en: "Feedback Mapper", zh: "反馈映射器" },
    body: { en: "5 feedback systems: logistic growth, innovation diffusion, price-demand, social proof, immune response. Loop diagrams + time series.", zh: "5 个反馈系统：逻辑斯蒂增长、创新扩散、价格需求、社会认同、免疫响应。环路图 + 时间序列。" },
    accent: "var(--warn)",
  },
  {
    id: "phase",
    icon: "⊸",
    title: { en: "Phase Transition", zh: "相变" },
    body: { en: "1D Ising model with 40 spins. Temperature slider drives order↔disorder transition. M vs T order parameter curve.", zh: "40 自旋的 1D Ising 模型。温度滑块驱动有序↔无序相变。M 对 T 的序参量曲线。" },
    accent: "var(--upside)",
  },
  {
    id: "analyst",
    icon: "⊛",
    title: { en: "Chaos Analyst", zh: "混沌分析师" },
    body: { en: "Synthesis across all modules. 2 critical findings, 1 warning, 2 insights, 1 robust signal. With recommended actions.", zh: "跨所有模块的综合。2 项严重发现、1 项警告、2 项洞见、1 项稳健信号。附推荐行动。" },
    accent: "var(--bad)",
  },
];

function Overview({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { lang, T } = useLang();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="grid-bg rounded-[3px] border border-[var(--line)] px-10 py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,255,203,0.04)] via-transparent to-[rgba(200,125,255,0.04)] pointer-events-none" />
        <div className="relative max-w-[720px]">
          <div className="k mb-4">{T("hero_kicker")}</div>
          <h1 className="text-[42px] md:text-[52px] font-medium tracking-tight leading-[1.1] mb-6">
            {lang === "en" ? (
              <>Stop controlling.<br /><span style={{ color: "var(--accent)" }}>Start navigating</span> the attractor.</>
            ) : (
              <>停止控制。<br />开始<span style={{ color: "var(--accent)" }}>导航吸引子</span>。</>
            )}
          </h1>
          <p className="text-[16px] text-[var(--ink-soft)] leading-[1.75] measure mb-8">
            {T("hero_body")}
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onNavigate("butterfly")} className="btn btn-primary">
              {T("hero_cta_butterfly")} →
            </button>
            <button onClick={() => onNavigate("emergence")} className="btn">
              {T("hero_cta_emergence")} →
            </button>
          </div>
        </div>
      </div>

      {/* Module grid */}
      <div>
        <div className="k mb-6">{lang === "zh" ? "模块" : "Modules"}</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map(m => (
            <button key={m.id} onClick={() => onNavigate(m.id)}
              className="card p-5 text-left hover:border-[var(--accent)] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[20px]" style={{ color: m.accent }}>{m.icon}</span>
                <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--ink)]">{m.title[lang]}</span>
              </div>
              <p className="text-[13px] text-[var(--ink-soft)] leading-[1.65]">{m.body[lang]}</p>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-dim)] group-hover:text-[var(--accent)] transition-all">
                {lang === "zh" ? "进入 →" : "Open →"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manifesto */}
      <div className="card p-8 border-[var(--line)]">
        <h2 className="text-[22px] font-medium mb-4">{T("goal_title")}</h2>
        <p className="text-[15px] text-[var(--ink-soft)] leading-[1.8] measure mb-6">{T("goal_body")}</p>
        <div className="grid md:grid-cols-3 gap-6 text-[13px]">
          {[
            {
              en: "Attractors, not trajectories",
              zh: "吸引子，而非轨迹",
              body_en: "You cannot predict the trajectory in a chaotic system. But you can map its attractors — the regions it will visit and the basins it will stay in.",
              body_zh: "你无法预测混沌系统中的轨迹。但你可以绘制其吸引子——它将访问的区域和它将停留的盆地。",
            },
            {
              en: "Emergence over reduction",
              zh: "涌现胜于还原",
              body_en: "The whole is not predictable from the parts. Gliders are not in cells. Consciousness is not in neurons. Work at the level where patterns emerge.",
              body_zh: "整体无法从各部分预测。滑翔机不在细胞中。意识不在神经元中。在模式涌现的层次工作。",
            },
            {
              en: "Phase shifts, not gradients",
              zh: "相变，而非梯度",
              body_en: "Some changes are continuous. Others are discontinuous jumps preceded by critical slowing down. Distinguish the two — they require completely different response strategies.",
              body_zh: "有些变化是连续的。其他变化是不连续的跳跃，之前有临界慢化。区分这两者——它们需要完全不同的响应策略。",
            },
          ].map((p, i) => (
            <div key={i} className="border-l-2 border-[var(--line)] pl-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--accent)" }}>{lang === "zh" ? p.zh : p.en}</div>
              <p className="text-[var(--ink-soft)] leading-[1.6]">{lang === "zh" ? p.body_zh : p.body_en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System model */}
      <div className="card p-8">
        <div className="k mb-4">{lang === "zh" ? "系统模型" : "System model"}</div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <pre className="font-mono text-[12px] text-[var(--ink-soft)] leading-[1.8] whitespace-pre-wrap">{`ComplexSystem = {
  attractors[],       // stable end-states
  basins[],           // regions of attraction
  feedbackLoops[],    // + amplifying / − stabilizing
  emergentProperties  // not in components
}

Navigation =
  map_attractors()
  + identify_basin_boundaries()
  + monitor_critical_slowing_down()
  + design_basin_perturbations()`}</pre>
          </div>
          <div className="space-y-3 text-[13px]">
            <p className="text-[var(--ink-soft)] leading-[1.7]">
              {lang === "zh"
                ? "混沌系统的不可预测性不是认识论的——不是因为我们不够聪明。它是本体论的——轨迹在原则上不可预测。但吸引子是稳定的。"
                : "The unpredictability of chaotic systems is not epistemological — not because we are not smart enough. It is ontological — trajectories are in principle unpredictable. But attractors are stable."}
            </p>
            <p className="text-[var(--ink-soft)] leading-[1.7]">
              {lang === "zh"
                ? "实践含义：在混沌中，预测是错误的问题。正确的问题是：哪些吸引子存在？哪些反馈环路控制着盆地切换？什么信号预告着相变？"
                : "Practical implication: in chaos, prediction is the wrong question. The right questions are: which attractors exist? Which feedback loops govern basin-switching? What signals precede phase transitions?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
