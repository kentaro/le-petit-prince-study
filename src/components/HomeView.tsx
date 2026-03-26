"use client";

import { Chapter, Progress } from "@/lib/types";
import { getDueCards } from "@/lib/progress";
import ChapterSelect from "./ChapterSelect";

interface HomeViewProps {
  chapters: Chapter[];
  progress: Progress;
  onStartReading: (chapterNumber: number) => void;
  onStartReview: () => void;
}

export default function HomeView({
  chapters,
  progress,
  onStartReading,
  onStartReview,
}: HomeViewProps) {
  const dueCards = getDueCards(progress);
  const totalVocab = chapters.reduce(
    (sum, ch) => sum + (ch.vocabulary?.length || 0),
    0
  );
  const progressPct = Math.round(
    (progress.completedChapters.length / 27) * 100
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-b from-navy to-navy-light text-cream px-4 pt-10 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-gold text-2xl mb-2">☆</p>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-bold mb-1">
            Le Petit Prince
          </h1>
          <p className="text-cream/60 text-sm">
            読みながら覚えるフランス語
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-4 pb-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {/* Streak */}
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl">
              {progress.streak > 0 ? "\uD83D\uDD25" : "\u2B50"}
            </p>
            <p className="text-lg font-bold">{progress.streak}</p>
            <p className="text-xs text-navy/40">日連続</p>
          </div>
          {/* Progress */}
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl">📖</p>
            <p className="text-lg font-bold">{progressPct}%</p>
            <p className="text-xs text-navy/40">
              {progress.completedChapters.length}/27章
            </p>
          </div>
          {/* Vocab */}
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl">📝</p>
            <p className="text-lg font-bold">{progress.knownWords.length}</p>
            <p className="text-xs text-navy/40">語彙</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">全体の進捗</p>
            <p className="text-xs text-navy/40">{progressPct}%</p>
          </div>
          <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-navy/30">Dédicace</p>
            <p className="text-xs text-navy/30">Ch. XXVII</p>
          </div>
        </div>

        {/* Review reminder */}
        {dueCards.length > 0 && (
          <button
            onClick={onStartReview}
            className="w-full bg-rose/10 hover:bg-rose/20 rounded-xl p-4 mb-4 text-left transition-colors tap-target"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose">
                  復習カード {dueCards.length} 枚
                </p>
                <p className="text-xs text-navy/40">
                  今日復習が必要な語彙があります
                </p>
              </div>
              <span className="text-rose text-xl">&rarr;</span>
            </div>
          </button>
        )}

        {/* Continue reading */}
        {progress.currentChapter <= 27 && (
          <button
            onClick={() => onStartReading(progress.currentChapter)}
            className="w-full bg-gold text-white hover:bg-gold/90 rounded-xl p-4 mb-6 text-left transition-colors tap-target shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {progress.completedChapters.length === 0
                    ? "学習を始める"
                    : "続きを読む"}
                </p>
                <p className="text-xs text-white/70">
                  Chapitre {progress.currentChapter} &mdash;{" "}
                  {chapters[progress.currentChapter - 1]?.theme}
                </p>
              </div>
              <span className="text-white/80 text-xl">&rarr;</span>
            </div>
          </button>
        )}

        {/* Chapter list */}
        <h2 className="text-sm font-medium text-navy/50 mb-3">
          Chapitres
        </h2>
        <ChapterSelect
          chapters={chapters}
          progress={progress}
          onSelect={onStartReading}
        />
      </main>
    </div>
  );
}
