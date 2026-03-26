"use client";

import { useMemo } from "react";
import { Chapter, Progress } from "@/lib/types";
import { getDueCards } from "@/lib/progress";
import ChapterSelect from "./ChapterSelect";

interface HomeViewProps {
  chapters: Chapter[];
  progress: Progress;
  onStartReading: (chapterNumber: number) => void;
  onStartReview: () => void;
  onShowVocabList: () => void;
}

export default function HomeView({
  chapters,
  progress,
  onStartReading,
  onStartReview,
  onShowVocabList,
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

        {/* Weekly activity heatmap */}
        <WeeklyActivity studyLog={progress.studyLog || []} />

        {/* SRS distribution */}
        <SRSDistribution progress={progress} chapters={chapters} />

        {/* Vocab list button */}
        <button
          onClick={onShowVocabList}
          className="w-full bg-periwinkle/10 hover:bg-periwinkle/20 rounded-xl p-4 mb-4 text-left transition-colors tap-target"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-periwinkle">
                語彙一覧
              </p>
              <p className="text-xs text-navy/40">
                学習した語彙を検索・フィルター
              </p>
            </div>
            <span className="text-periwinkle text-xl">&rarr;</span>
          </div>
        </button>

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

// --- Sub-components ---

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

function WeeklyActivity({ studyLog }: { studyLog: { date: string; wordsReviewed: number }[] }) {
  const days = useMemo(() => {
    const result: { label: string; date: string; active: boolean; words: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0
      const entry = studyLog.find((e) => e.date === dateStr);
      result.push({
        label: DAY_LABELS[dayOfWeek],
        date: dateStr,
        active: !!entry,
        words: entry?.wordsReviewed || 0,
      });
    }
    return result;
  }, [studyLog]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <p className="text-sm font-medium mb-3">今週の学習</p>
      <div className="flex justify-between gap-1">
        {days.map((day) => (
          <div key={day.date} className="flex-1 text-center">
            <div
              className={`w-full aspect-square rounded-lg mb-1 flex items-center justify-center text-xs ${
                day.active
                  ? "bg-sage/30 text-sage font-medium"
                  : "bg-cream-dark text-navy/20"
              }`}
            >
              {day.active ? day.words || "✓" : ""}
            </div>
            <p className="text-xs text-navy/30">{day.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SRSDistribution({ progress, chapters }: { progress: Progress; chapters: Chapter[] }) {
  const stats = useMemo(() => {
    const allVocab = chapters.flatMap((ch) => ch.vocabulary || []);
    const posCount: Record<string, { total: number; known: number }> = {};
    for (const v of allVocab) {
      if (!posCount[v.pos]) posCount[v.pos] = { total: 0, known: 0 };
      posCount[v.pos].total++;
      if (progress.knownWords.includes(v.french.toLowerCase())) {
        posCount[v.pos].known++;
      }
    }

    // SRS intervals distribution
    const cards = Object.values(progress.vocab);
    const newCards = cards.filter((c) => c.repetitions === 0).length;
    const learning = cards.filter((c) => c.repetitions > 0 && c.interval <= 7).length;
    const mature = cards.filter((c) => c.interval > 7).length;

    return { posCount, newCards, learning, mature, totalCards: cards.length };
  }, [progress, chapters]);

  const posLabels: Record<string, string> = {
    nom: "名詞", verbe: "動詞", adj: "形容詞", adv: "副詞", expr: "表現", "prép": "前置詞",
  };
  const posColors: Record<string, string> = {
    nom: "bg-periwinkle", verbe: "bg-sage", adj: "bg-rose", adv: "bg-lavender", expr: "bg-sand", "prép": "bg-gold",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <p className="text-sm font-medium mb-3">学習分析</p>

      {/* SRS stages */}
      {stats.totalCards > 0 && (
        <div className="mb-4">
          <p className="text-xs text-navy/40 mb-2">SRS ステージ</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-rose/10 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-rose">{stats.newCards}</p>
              <p className="text-xs text-navy/40">新規</p>
            </div>
            <div className="flex-1 bg-gold/10 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-gold">{stats.learning}</p>
              <p className="text-xs text-navy/40">学習中</p>
            </div>
            <div className="flex-1 bg-sage/10 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-sage">{stats.mature}</p>
              <p className="text-xs text-navy/40">定着</p>
            </div>
          </div>
        </div>
      )}

      {/* POS breakdown */}
      <p className="text-xs text-navy/40 mb-2">品詞別進捗</p>
      <div className="space-y-2">
        {Object.entries(stats.posCount)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([pos, { total, known }]) => {
            const pct = total > 0 ? Math.round((known / total) * 100) : 0;
            return (
              <div key={pos}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-navy/60">{posLabels[pos] || pos}</span>
                  <span className="text-navy/30">
                    {known}/{total} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full progress-fill ${posColors[pos] || "bg-navy/20"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
