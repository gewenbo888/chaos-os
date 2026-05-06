export type Lang = "en" | "zh";
export type Bilingual = { en: string; zh: string };
export const t = (b: Bilingual, lang: Lang) => b[lang];

export const ui = {
  brand: { en: "Chaos OS", zh: "混沌操作系统" },
  brand_sub: { en: "Complexity · emergence · nonlinear dynamics", zh: "复杂性 · 涌现 · 非线性动力学" },

  nav_overview:   { en: "Overview",      zh: "总览" },
  nav_butterfly:  { en: "Butterfly",     zh: "蝴蝶效应" },
  nav_attractors: { en: "Attractors",    zh: "吸引子" },
  nav_emergence:  { en: "Emergence",     zh: "涌现" },
  nav_feedback:   { en: "Feedback",      zh: "反馈" },
  nav_phase:      { en: "Phase",         zh: "相变" },
  nav_analyst:    { en: "Analyst",       zh: "分析师" },

  hero_kicker: { en: "A system to understand complexity, emergence, and nonlinear dynamics", zh: "理解复杂性、涌现与非线性动力学的系统" },
  hero_title:  { en: "Stop controlling. Start navigating the attractor.", zh: "停止控制。开始导航吸引子。" },
  hero_body: {
    en: "Chaos is not disorder. It is order too complex to predict from initial conditions. The question is not how to eliminate sensitivity — it is how to navigate between attractors. Chaos OS is a working surface for the butterfly effect, strange attractors, emergence, feedback loops, and phase transitions.",
    zh: "混沌不是无序。它是过于复杂而无法从初始条件预测的秩序。问题不在于如何消除敏感性——而在于如何在吸引子之间导航。混沌操作系统是探索蝴蝶效应、奇异吸引子、涌现、反馈环路与相变的工作平面。",
  },
  hero_cta_butterfly:  { en: "Explore butterfly effect", zh: "探索蝴蝶效应" },
  hero_cta_emergence:  { en: "Watch emergence", zh: "观察涌现" },

  goal_title: { en: "Chaos is not disorder.", zh: "混沌不是无序。" },
  goal_body: {
    en: "It is order too complex to predict from initial conditions. The question is not how to eliminate sensitivity — it is how to navigate between attractors.",
    zh: "它是过于复杂而无法从初始条件预测的秩序。问题不在于如何消除敏感性——而在于如何在吸引子之间导航。",
  },

  footer: { en: "Part of the Psyverse — independent research portfolio by Gewenbo.", zh: "Psyverse 投资组合的一部分 — Gewenbo 独立研究项目。" },
} satisfies Record<string, Bilingual>;

export type UIKey = keyof typeof ui;
