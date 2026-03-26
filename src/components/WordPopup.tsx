"use client";

import { VocabEntry } from "@/lib/types";

const posLabels: Record<string, string> = {
  nom: "名詞",
  verbe: "動詞",
  adj: "形容詞",
  adv: "副詞",
  expr: "表現",
  prép: "前置詞",
};

const posColors: Record<string, string> = {
  nom: "text-periwinkle",
  verbe: "text-sage",
  adj: "text-rose",
  adv: "text-lavender",
  expr: "text-sand",
  prép: "text-gold",
};

interface WordPopupProps {
  entry: VocabEntry;
  isKnown: boolean;
  onMarkKnown: () => void;
  onAddToReview: () => void;
  onClose: () => void;
}

export default function WordPopup({
  entry,
  isKnown,
  onMarkKnown,
  onAddToReview,
  onClose,
}: WordPopupProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-navy/20" />
      <div
        className="relative bg-cream rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm mx-auto p-5 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold font-[family-name:var(--font-serif)]">
              {entry.french}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-medium ${posColors[entry.pos] || "text-navy"}`}
              >
                {posLabels[entry.pos] || entry.pos}
              </span>
              {entry.gender && (
                <span className="text-xs bg-cream-dark rounded-full px-2 py-0.5">
                  {entry.gender === "m" ? "男性" : "女性"}
                </span>
              )}
              <span className="text-xs bg-gold/20 text-gold rounded-full px-2 py-0.5">
                {entry.cefr}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-navy/40 hover:text-navy text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Meaning */}
        <div className="bg-cream-dark rounded-xl p-3 mb-3">
          <p className="text-lg font-medium">{entry.japanese}</p>
        </div>

        {/* Example */}
        {entry.example && (
          <div className="mb-4">
            <p className="text-xs text-navy/50 mb-1">原文での用法</p>
            <p className="font-[family-name:var(--font-serif)] text-sm italic text-navy/80 leading-relaxed">
              &laquo; {entry.example} &raquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onMarkKnown}
            className={`flex-1 tap-target flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isKnown
                ? "bg-sage/20 text-sage"
                : "bg-cream-dark hover:bg-sage/20 text-navy/60 hover:text-sage"
            }`}
          >
            {isKnown ? "\u2713 覚えた" : "\u2713 覚えた"}
          </button>
          <button
            onClick={onAddToReview}
            className="flex-1 tap-target flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
          >
            {"\u2606"} 復習リスト
          </button>
        </div>
      </div>
    </div>
  );
}
