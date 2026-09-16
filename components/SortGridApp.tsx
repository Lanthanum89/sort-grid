"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sun,
} from "lucide-react";
import { CodePanel } from "./CodePanel";
import { ALGORITHM_LABELS, recordSort, type Algorithm, type Step } from "@/lib/sorts";
import { CODE, LANGUAGE_LABELS, type Language } from "@/lib/code";

const INITIAL = [6, 2, 8, 3, 1, 7, 4, 5];
const SPEEDS = [1400, 800, 420, 190];
const SPEED_LABELS = ["0.5×", "1×", "2×", "4×"];

const shuffle = (values: number[]) => {
  let next = [...values];
  do {
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  } while (next.every((value, index) => value === values[index]));
  return next;
};

function Car({ value, state, sorted }: { value: number; state: Step["type"] | "idle"; sorted: boolean }) {
  return (
    <div className={`car car--${state}${sorted ? " car--sorted" : ""}`}>
      {sorted && <span className="sorted-flag" title="Position confirmed"><Flag size={12} fill="currentColor" /></span>}
      <svg viewBox="0 0 64 112" role="img" aria-label={`Car ${value}`}>
        <path className="car-shadow" d="M14 102h36l5-9-4-10V46l-8-19-4-18H25l-4 18-8 19v37L9 93z" />
        <path className="car-body" d="M18 96h28l4-8-3-8V48l-7-18-3-16H27l-3 16-7 18v32l-3 8z" />
        <path className="car-wing" d="M8 19h48v10H8zM10 83h44v9H10z" />
        <path className="car-tyre" d="M8 32h9v20H8zM47 32h9v20h-9zM8 66h9v18H8zM47 66h9v18h-9z" />
        <path className="car-cockpit" d="M27 40h10l5 13-4 20H26l-4-20z" />
        <text x="32" y="64" textAnchor="middle">{value}</text>
      </svg>
    </div>
  );
}

function Segment<T extends string>({
  values,
  selected,
  labels,
  onChange,
  ariaLabel,
}: {
  values: readonly T[];
  selected: T;
  labels: Record<T, string>;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="segment" role="group" aria-label={ariaLabel}>
      {values.map((value) => (
        <button
          type="button"
          key={value}
          className={selected === value ? "is-selected" : ""}
          aria-pressed={selected === value}
          onClick={() => onChange(value)}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );
}

export default function SortGridApp() {
  const [base, setBase] = useState(INITIAL);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble");
  const [language, setLanguage] = useState<Language>("javascript");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [dark, setDark] = useState(false);

  const steps = useMemo(() => recordSort(algorithm, base), [algorithm, base]);
  const step = steps[stepIndex] ?? steps[0];
  const code = CODE[algorithm][language];
  const activeLine = code.keys[step.key] ?? code.keys.start;

  const resetPlayback = useCallback(() => {
    setPlaying(false);
    setStepIndex(0);
  }, []);

  const move = useCallback((delta: number) => {
    setPlaying(false);
    setStepIndex((current) => Math.max(0, Math.min(steps.length - 1, current + delta)));
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStepIndex((current) => current + 1), SPEEDS[speedIndex]);
    return () => window.clearTimeout(timer);
  }, [playing, speedIndex, stepIndex, steps.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const comparisons = steps.slice(0, stepIndex + 1).filter((item) => item.type === "compare").length;
  const swaps = steps.slice(0, stepIndex + 1).filter((item) => item.type === "swap").length;

  const stateFor = (position: number, value: number): Step["type"] | "idle" => {
    if (step.indices.includes(position) && ["compare", "swap", "current"].includes(step.type)) return step.type;
    if (step.sortedSoFar.includes(value)) return "sorted";
    return "idle";
  };

  const newGrid = () => {
    setBase((current) => shuffle(current));
    resetPlayback();
  };

  const selectAlgorithm = (next: Algorithm) => {
    setAlgorithm(next);
    resetPlayback();
  };

  useEffect(() => {
    const modelContext = (document as Document & {
      modelContext?: {
        registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const report = (error: unknown) => console.warn("Sort Grid tool registration failed", error);

    const configure = modelContext.registerTool({
      name: "configure_sort_grid",
      title: "Configure Sort Grid",
      description: "Choose the sorting algorithm and code language shown in the visualiser, then return playback to the first recorded step.",
      inputSchema: {
        type: "object",
        properties: {
          algorithm: { type: "string", enum: ["bubble", "insertion", "selection", "quick"] },
          language: { type: "string", enum: ["javascript", "python", "csharp"] },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = input as { algorithm?: Algorithm; language?: Language };
        if (value.algorithm) setAlgorithm(value.algorithm);
        if (value.language) setLanguage(value.language);
        resetPlayback();
        return { algorithm: value.algorithm ?? algorithm, language: value.language ?? language, step: 1 };
      },
    }, { signal: lifecycle.signal });

    const reshuffle = modelContext.registerTool({
      name: "reshuffle_sort_grid",
      title: "Reshuffle Sort Grid",
      description: "Create a different eight-car starting order without changing the selected algorithm or language.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        const next = shuffle(base);
        setBase(next);
        resetPlayback();
        return { grid: next };
      },
    }, { signal: lifecycle.signal });

    void Promise.all([Promise.resolve(configure), Promise.resolve(reshuffle)]).catch(report);
    return () => lifecycle.abort();
  }, [algorithm, base, language, resetPlayback]);

  return (
    <main className={dark ? "app dark" : "app"}>
      <header className="site-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><span>01</span><span>10</span></span>
          <div>
            <p className="eyebrow">CODERMUMUK LAB / 004</p>
            <h1>Sort Grid</h1>
          </div>
        </div>
        <div className="header-actions">
          <span className="keyboard-hint"><kbd>←</kbd><kbd>→</kbd> STEP <kbd>SPACE</kbd> PLAY</span>
          <button className="icon-button" type="button" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <section className="control-panel" aria-label="Sort controls">
        <div className="control-group control-group--wide">
          <span className="control-label">Algorithm</span>
          <Segment
            values={["bubble", "insertion", "selection", "quick"] as const}
            selected={algorithm}
            labels={ALGORITHM_LABELS}
            onChange={selectAlgorithm}
            ariaLabel="Choose sorting algorithm"
          />
        </div>
        <button className="action-button" type="button" onClick={newGrid}><Shuffle size={17} /> New grid</button>
      </section>

      <section className="stats" aria-label="Live statistics">
        <div><span>Step</span><strong>{stepIndex + 1}<small> / {steps.length}</small></strong></div>
        <div><span>Comparisons</span><strong>{comparisons}</strong></div>
        <div><span>Swaps</span><strong>{swaps}</strong></div>
        <div><span>On track</span><strong>{ALGORITHM_LABELS[algorithm]} sort</strong></div>
      </section>

      <div className="workspace">
        <section className="panel grid-panel" aria-label="Starting grid visualisation">
          <div className="panel-heading">
            <div><span className="panel-number">01</span><h2>Starting grid</h2></div>
            <span className={`status-badge status-badge--${step.type}`}>{step.type}</span>
          </div>
          <div className="track">
            <div className="chequered-line" aria-hidden="true" />
            <span className="line-label">START / FINISH</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((position) => {
              const col = position % 2;
              const row = Math.floor(position / 2);
              return <span key={position} className="grid-slot" style={{ left: col ? "59%" : "17%", top: `${54 + row * 90 + (col ? 38 : 0)}px` }}>P{position + 1}</span>;
            })}
            {step.arr.map((value, position) => {
              const col = position % 2;
              const row = Math.floor(position / 2);
              return (
                <div
                  className="car-position"
                  key={value}
                  style={{ left: col ? "68%" : "26%", top: `${36 + row * 90 + (col ? 38 : 0)}px` }}
                >
                  <Car value={value} state={stateFor(position, value)} sorted={step.sortedSoFar.includes(value)} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel code-panel" aria-label="Algorithm source code">
          <div className="panel-heading panel-heading--code">
            <div><span className="panel-number">02</span><h2>Live source</h2></div>
            <Segment
              values={["javascript", "python", "csharp"] as const}
              selected={language}
              labels={LANGUAGE_LABELS}
              onChange={setLanguage}
              ariaLabel="Choose code language"
            />
          </div>
          <div className="code-meta">
            <span>{ALGORITHM_LABELS[algorithm].toUpperCase()}_SORT</span>
            <span>KEY: {step.key}</span>
          </div>
          <CodePanel lines={code.lines} activeLine={activeLine} language={language} dark={dark} />
        </section>
      </div>

      <section className="player" aria-label="Step player">
        <div className="player-buttons">
          <button type="button" className="square-button" onClick={() => { setStepIndex(0); setPlaying(false); }} aria-label="Restart"><RotateCcw size={18} /></button>
          <button type="button" className="square-button" onClick={() => move(-1)} disabled={stepIndex === 0} aria-label="Previous step"><ArrowLeft size={19} /></button>
          <button type="button" className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="square-button" onClick={() => move(1)} disabled={stepIndex === steps.length - 1} aria-label="Next step"><ArrowRight size={19} /></button>
        </div>
        <label className="scrubber">
          <span className="sr-only">Current step</span>
          <input type="range" min="0" max={steps.length - 1} value={stepIndex} onChange={(event) => { setPlaying(false); setStepIndex(Number(event.target.value)); }} />
        </label>
        <label className="speed-control">
          <span>Speed</span>
          <select value={speedIndex} onChange={(event) => setSpeedIndex(Number(event.target.value))}>
            {SPEED_LABELS.map((label, index) => <option value={index} key={label}>{label}</option>)}
          </select>
        </label>
      </section>

      <footer><span>8 UNIQUE VALUES</span><span>RECORDED EXECUTION</span><span>SEMANTIC LINE SYNC</span></footer>
    </main>
  );
}
