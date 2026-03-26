"use client";

import { useState } from "react";
import { VocabEntry, SRSCard } from "@/lib/types";
import { speakFrench, isSpeechSupported } from "@/lib/speech";

interface FlashCardProps {
  entry: VocabEntry;
  card: SRSCard;
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  current: number;
  total: number;
}

export default function FlashCard({
  entry,
  card,
  onRate,
  current,
  total,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="max-w-sm mx-auto w-full">
      {/* Counter */}
      <p className="text-center text-xs text-navy/40 mb-4">
        {current} / {total}
      </p>

      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 min-h-[280px] flex flex-col items-center justify-center cursor-pointer"
        onClick={() => !revealed && setRevealed(true)}
      >
        {/* French word */}
        <p className="font-[family-name:var(--font-serif)] text-3xl font-bold mb-2">
          {entry.french}
        </p>

        {/* Part of speech & gender */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-navy/40">{entry.pos}</span>
          {entry.gender && (
            <span className="text-xs text-navy/40">
              [{entry.gender}]
            </span>
          )}
        </div>

        {/* Pronunciation */}
        {isSpeechSupported() && (
          <button
            onClick={(e) => { e.stopPropagation(); speakFrench(entry.french, 0.7); }}
            className="tap-target mb-2 text-navy/40 hover:text-gold transition-colors text-lg"
            title="発音を聞く"
          >
            &#x1f50a;
          </button>
        )}

        {/* Context sentence */}
        <p className="font-[family-name:var(--font-serif)] text-sm italic text-navy/50 text-center leading-relaxed mb-4">
          &laquo; {entry.example} &raquo;
        </p>

        {!revealed ? (
          <p className="text-sm text-gold/60 mt-4">
            タップして意味を確認
          </p>
        ) : (
          <div className="fade-in mt-4 text-center">
            <div className="h-px bg-sand/30 w-16 mx-auto mb-4" />
            <p className="text-xl font-medium">{entry.japanese}</p>
            {card.repetitions > 0 && (
              <p className="text-xs text-navy/30 mt-2">
                復習 {card.repetitions} 回目
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div className="flex gap-2 mt-4 fade-in">
          <button
            onClick={() => { onRate(1); setRevealed(false); }}
            className="flex-1 tap-target bg-rose/20 hover:bg-rose/30 text-rose rounded-xl py-3 text-sm font-medium transition-colors"
          >
            難しい
          </button>
          <button
            onClick={() => { onRate(3); setRevealed(false); }}
            className="flex-1 tap-target bg-gold/20 hover:bg-gold/30 text-gold rounded-xl py-3 text-sm font-medium transition-colors"
          >
            微妙
          </button>
          <button
            onClick={() => { onRate(5); setRevealed(false); }}
            className="flex-1 tap-target bg-sage/20 hover:bg-sage/30 text-sage rounded-xl py-3 text-sm font-medium transition-colors"
          >
            簡単
          </button>
        </div>
      )}
    </div>
  );
}
