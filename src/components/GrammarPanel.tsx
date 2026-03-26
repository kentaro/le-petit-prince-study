"use client";

import { useState } from "react";
import { GrammarPoint } from "@/lib/types";

interface GrammarPanelProps {
  grammar: GrammarPoint[];
}

export default function GrammarPanel({ grammar }: GrammarPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-3 mb-4 fade-in">
      <h3 className="text-sm font-medium text-navy/50 flex items-center gap-1">
        <span className="text-periwinkle">◆</span> Grammaire
      </h3>
      {grammar.map((point, idx) => (
        <div
          key={idx}
          className="bg-cream-dark rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            className="w-full text-left p-3 flex items-center justify-between tap-target"
          >
            <span className="text-sm font-medium">{point.title}</span>
            <span className="text-navy/30 text-xs">
              {expanded === idx ? "\▲" : "\▼"}
            </span>
          </button>
          {expanded === idx && (
            <div className="px-3 pb-3 fade-in">
              <p className="text-sm text-navy/70 mb-3">{point.explanation}</p>
              {point.examples.map((ex, eIdx) => (
                <div
                  key={eIdx}
                  className="bg-cream rounded-lg p-3 mb-2 last:mb-0"
                >
                  <p className="font-[family-name:var(--font-serif)] text-sm italic mb-1">
                    {ex.french}
                  </p>
                  <p className="text-xs text-navy/50 mb-1">{ex.breakdown}</p>
                  <p className="text-sm text-navy/70">{ex.japanese}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
