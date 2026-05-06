"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";

const ROWS = 20;
const COLS = 20;
const CELL = 22;

type Grid = boolean[][];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
}

function nextGen(g: Grid): Grid {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + ROWS) % ROWS;
          const nc = (c + dc + COLS) % COLS;
          if (g[nr][nc]) n++;
        }
      return g[r][c] ? n === 2 || n === 3 : n === 3;
    })
  );
}

function setPattern(name: string): Grid {
  const g = emptyGrid();
  const mid = Math.floor(ROWS / 2);
  const midC = Math.floor(COLS / 2);
  if (name === "glider") {
    [[0,1],[1,2],[2,0],[2,1],[2,2]].forEach(([r,c]) => { g[r+2][c+2] = true; });
  } else if (name === "blinker") {
    g[mid][midC-1] = g[mid][midC] = g[mid][midC+1] = true;
  } else if (name === "block") {
    g[mid][midC] = g[mid][midC+1] = g[mid+1][midC] = g[mid+1][midC+1] = true;
  } else if (name === "beehive") {
    [[0,1],[0,2],[1,0],[1,3],[2,1],[2,2]].forEach(([r,c]) => { g[mid-1+r][midC-1+c] = true; });
  }
  return g;
}

function calcEntropy(g: Grid): number {
  const total = ROWS * COLS;
  const alive = g.flat().filter(Boolean).length;
  const dead = total - alive;
  if (alive === 0 || dead === 0) return 0;
  const pa = alive / total;
  const pd = dead / total;
  return -(pa * Math.log2(pa) + pd * Math.log2(pd));
}

function emergenceScore(g: Grid): number {
  // heuristic: count 2x2 live blocks as "organized"
  let organized = 0;
  for (let r = 0; r < ROWS - 1; r++)
    for (let c = 0; c < COLS - 1; c++)
      if (g[r][c] && g[r+1][c] && g[r][c+1] && g[r+1][c+1]) organized++;
  const alive = g.flat().filter(Boolean).length;
  return alive > 0 ? Math.min(1, organized / (alive * 0.25)) : 0;
}

export function EmergenceEngine() {
  const { lang } = useLang();
  const [grid, setGrid] = useState<Grid>(() => setPattern("glider"));
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef(grid);
  const genRef = useRef(gen);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { genRef.current = gen; }, [gen]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setGrid(g => nextGen(g));
        setGen(g => g + 1);
      }, 120);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const toggle = useCallback((r: number, c: number) => {
    setGrid(g => {
      const next = g.map(row => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  }, []);

  const step = useCallback(() => {
    setGrid(g => nextGen(g));
    setGen(g => g + 1);
  }, []);

  const reset = useCallback((pattern?: string) => {
    setRunning(false);
    setGrid(pattern ? setPattern(pattern) : emptyGrid());
    setGen(0);
  }, []);

  const alive = grid.flat().filter(Boolean).length;
  const entropy = calcEntropy(grid).toFixed(3);
  const emergence = emergenceScore(grid);

  const SVG_W = COLS * CELL + 2;
  const SVG_H = ROWS * CELL + 2;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="k mb-1">{lang === "zh" ? "康威生命游戏 · 20×20" : "Conway's Game of Life · 20×20"}</div>
        <h3 className="text-[18px] font-medium mb-4">
          {lang === "zh" ? "整体无法从各部分预测——这就是涌现" : "The whole cannot be predicted from the parts — this is emergence"}
        </h3>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="shrink-0">
            <svg width={SVG_W} height={SVG_H} style={{ cursor: "pointer" }}>
              {Array.from({ length: ROWS }, (_, r) =>
                Array.from({ length: COLS }, (_, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c * CELL + 1}
                    y={r * CELL + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    fill={grid[r][c] ? "var(--accent)" : "var(--bg-elev-2)"}
                    stroke="var(--line)"
                    strokeWidth="0.5"
                    rx="1"
                    onClick={() => toggle(r, c)}
                    style={{ transition: "fill 0.08s ease" }}
                  />
                ))
              )}
            </svg>
            <p className="text-[11px] font-mono text-[var(--ink-dim)] mt-2">
              {lang === "zh" ? "点击格子切换状态" : "Click cells to toggle"}
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: lang === "zh" ? "代数" : "Generation", value: gen, color: "var(--ink)" },
                { label: lang === "zh" ? "存活细胞" : "Live cells", value: alive, color: "var(--accent)" },
                { label: lang === "zh" ? "熵值" : "Entropy", value: entropy, color: "var(--baseline)" },
                { label: lang === "zh" ? "涌现分数" : "Emergence score", value: (emergence * 100).toFixed(0) + "%", color: "var(--tail)" },
              ].map(s => (
                <div key={s.label} className="border border-[var(--line)] rounded-[2px] p-3">
                  <div className="k mb-1">{s.label}</div>
                  <div className="font-mono text-[22px]" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="k mb-2">{lang === "zh" ? "预设模式" : "Preset patterns"}</div>
              <div className="flex flex-wrap gap-2">
                {["glider","blinker","block","beehive"].map(p => (
                  <button key={p} className="btn !py-1 !px-3 font-mono text-[11px]" onClick={() => { reset(p); }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="k mb-2">{lang === "zh" ? "控制" : "Controls"}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`btn ${running ? "" : "btn-primary"} !py-1 !px-4 font-mono text-[12px]`}
                  onClick={() => setRunning(r => !r)}>
                  {running ? (lang === "zh" ? "⏸ 暂停" : "⏸ Pause") : (lang === "zh" ? "▶ 播放" : "▶ Play")}
                </button>
                <button className="btn !py-1 !px-3 font-mono text-[11px]" onClick={step} disabled={running}>
                  {lang === "zh" ? "⏭ 单步" : "⏭ Step"}
                </button>
                <button className="btn !py-1 !px-3 font-mono text-[11px]" onClick={() => reset()}>
                  {lang === "zh" ? "↺ 重置" : "↺ Reset"}
                </button>
              </div>
            </div>

            <div className="border-l-2 border-[var(--tail)] pl-4">
              <p className="text-[12px] text-[var(--ink-soft)] leading-[1.7]">
                {lang === "zh"
                  ? "仅有三条规则——存活需2-3邻居，诞生需恰好3邻居——却产生了滑翔机、振荡器和复杂的涌现结构。没有中央控制。"
                  : "Just three rules — survival needs 2-3 neighbors, birth needs exactly 3 — yet produces gliders, oscillators, and complex emergent structures. No central control."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
