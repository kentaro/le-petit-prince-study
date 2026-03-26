"use client";

import { useState, useRef, useEffect } from "react";
import { ConjugationDrill as ConjDrill } from "@/lib/types";

const PRONOUNS = ["je", "tu", "il", "nous", "vous", "ils"] as const;

interface ConjugationDrillProps {
  drill: ConjDrill;
  onComplete: (score: number) => void;
  current: number;
  total: number;
}

export default function ConjugationDrill({
  drill,
  onComplete,
  current,
  total,
}: ConjugationDrillProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setAnswers({});
    setChecked(false);
    setShowHint(false);
    // Focus first input
    const first = inputRefs.current["je"];
    if (first) first.focus();
  }, [drill]);

  const handleChange = (pronoun: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [pronoun]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx < PRONOUNS.length - 1) {
        const next = inputRefs.current[PRONOUNS[idx + 1]];
        if (next) next.focus();
      } else {
        handleCheck();
      }
    }
  };

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ");

  const handleCheck = () => {
    setChecked(true);
    let correct = 0;
    for (const p of PRONOUNS) {
      if (normalize(answers[p] || "") === normalize(drill.forms[p])) {
        correct++;
      }
    }
    // Score as percentage
    const score = Math.round((correct / 6) * 100);
    setTimeout(() => onComplete(score), 2000);
  };

  const getStatus = (pronoun: string) => {
    if (!checked) return "pending";
    const userAns = normalize(answers[pronoun] || "");
    const correctAns = normalize(drill.forms[pronoun as keyof typeof drill.forms]);
    return userAns === correctAns ? "correct" : "wrong";
  };

  return (
    <div className="max-w-sm mx-auto w-full">
      <p className="text-center text-xs text-navy/40 mb-4">
        {current} / {total}
      </p>

      {/* Verb info */}
      <div className="text-center mb-6">
        <p className="font-[family-name:var(--font-serif)] text-2xl font-bold">
          {drill.verb}
        </p>
        <p className="text-sm text-navy/60 mt-1">{drill.meaning}</p>
        <p className="text-xs text-gold mt-1">
          {drill.tense} &middot; {drill.group === 1 ? "1er" : drill.group === 2 ? "2e" : "3e"} groupe
        </p>
      </div>

      {/* Conjugation inputs */}
      <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
        {PRONOUNS.map((pronoun, idx) => {
          const status = getStatus(pronoun);
          return (
            <div key={pronoun} className="flex items-center gap-3">
              <span className="w-12 text-right text-sm text-navy/50 font-medium">
                {pronoun}
              </span>
              <div className="flex-1 relative">
                <input
                  ref={(el) => { inputRefs.current[pronoun] = el; }}
                  type="text"
                  value={answers[pronoun] || ""}
                  onChange={(e) => handleChange(pronoun, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  disabled={checked}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-[family-name:var(--font-serif)] outline-none transition-colors ${
                    status === "correct"
                      ? "bg-sage/15 border-2 border-sage"
                      : status === "wrong"
                        ? "bg-rose/15 border-2 border-rose"
                        : "bg-cream-dark border-2 border-transparent focus:border-gold/50"
                  }`}
                  placeholder="..."
                />
                {status === "wrong" && (
                  <p className="text-xs text-rose mt-0.5">
                    {drill.forms[pronoun as keyof typeof drill.forms]}
                  </p>
                )}
              </div>
              <span className="w-6 text-center">
                {status === "correct" && (
                  <span className="text-sage">✓</span>
                )}
                {status === "wrong" && (
                  <span className="text-rose">✗</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      {showHint && !checked && (
        <div className="bg-cream-dark rounded-xl p-3 mt-3 fade-in">
          <p className="text-xs text-navy/50 mb-1">原文より</p>
          <p className="font-[family-name:var(--font-serif)] text-sm italic">
            &laquo; {drill.contextSentence} &raquo;
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {!checked && (
          <>
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex-1 tap-target bg-cream-dark hover:bg-sand/20 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {showHint ? "ヒント非表示" : "ヒント"}
            </button>
            <button
              onClick={handleCheck}
              className="flex-1 tap-target bg-gold text-white hover:bg-gold/90 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              チェック
            </button>
          </>
        )}
      </div>
    </div>
  );
}
