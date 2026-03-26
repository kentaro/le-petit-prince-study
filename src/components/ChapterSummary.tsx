"use client";

import { Chapter, Progress } from "@/lib/types";

interface ChapterSummaryProps {
  chapter: Chapter;
  progress: Progress;
  onContinue: () => void;
}

export default function ChapterSummary({
  chapter,
  progress,
  onContinue,
}: ChapterSummaryProps) {
  const vocabCount = chapter.vocabulary.length;
  const knownInChapter = chapter.vocabulary.filter((v) =>
    progress.knownWords.includes(v.french.toLowerCase())
  ).length;
  const grammarCount = chapter.grammar.length;
  const conjugationVerbs = chapter.conjugations?.length || 0;
  const avgConjScore =
    conjugationVerbs > 0
      ? Math.round(
          chapter.conjugations.reduce(
            (sum, d) => sum + (progress.conjugationScores[d.verb] || 0),
            0
          ) / conjugationVerbs
        )
      : null;
  const completedCount = progress.completedChapters.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Celebration */}
        <div className="mb-6">
          <p className="text-5xl mb-3">&#x2728;</p>
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold mb-1">
            Chapitre {chapter.number} terminé !
          </h2>
          <p className="text-sm text-navy/50">{chapter.theme}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-periwinkle">{vocabCount}</p>
            <p className="text-xs text-navy/40">語彙</p>
            <p className="text-xs text-sage mt-0.5">
              {knownInChapter} 語習得
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-sage">{grammarCount}</p>
            <p className="text-xs text-navy/40">文法ポイント</p>
          </div>
          {conjugationVerbs > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-gold">
                {avgConjScore !== null ? `${avgConjScore}%` : "-"}
              </p>
              <p className="text-xs text-navy/40">活用スコア</p>
              <p className="text-xs text-navy/30 mt-0.5">
                {conjugationVerbs} 動詞
              </p>
            </div>
          )}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-rose">
              {completedCount}/27
            </p>
            <p className="text-xs text-navy/40">全体進捗</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-cream-dark rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full progress-fill"
            style={{ width: `${Math.round((completedCount / 27) * 100)}%` }}
          />
        </div>

        {/* New vocab learned */}
        {knownInChapter > 0 && (
          <div className="bg-sage/10 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs text-sage font-medium mb-2">
              この章で覚えた語彙
            </p>
            <div className="flex flex-wrap gap-1.5">
              {chapter.vocabulary
                .filter((v) =>
                  progress.knownWords.includes(v.french.toLowerCase())
                )
                .slice(0, 12)
                .map((v) => (
                  <span
                    key={v.french}
                    className="text-xs bg-white rounded-full px-2 py-0.5 font-[family-name:var(--font-serif)]"
                  >
                    {v.french}
                  </span>
                ))}
              {knownInChapter > 12 && (
                <span className="text-xs text-navy/30">
                  +{knownInChapter - 12}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full tap-target bg-gold text-white hover:bg-gold/90 rounded-xl py-4 text-sm font-medium transition-colors shadow-sm"
        >
          {chapter.number < 27
            ? `次のチャプターへ (Ch. ${chapter.number + 1})`
            : "ホームに戻る"}
        </button>
      </div>
    </div>
  );
}
