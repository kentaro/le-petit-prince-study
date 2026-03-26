"use client";

import { Chapter, Progress } from "@/lib/types";

interface ChapterSelectProps {
  chapters: Chapter[];
  progress: Progress;
  onSelect: (chapterNumber: number) => void;
}

export default function ChapterSelect({
  chapters,
  progress,
  onSelect,
}: ChapterSelectProps) {
  return (
    <div className="space-y-2">
      {chapters.map((ch) => {
        const completed = progress.completedChapters.includes(ch.number);
        const isCurrent = ch.number === progress.currentChapter;

        return (
          <button
            key={ch.number}
            onClick={() => onSelect(ch.number)}
            className={`w-full text-left p-4 rounded-xl transition-all tap-target ${
              completed
                ? "bg-sage/10 hover:bg-sage/20"
                : isCurrent
                  ? "bg-gold/10 hover:bg-gold/20 ring-2 ring-gold/30"
                  : "bg-white hover:bg-cream-dark"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completed
                      ? "bg-sage text-white"
                      : isCurrent
                        ? "bg-gold text-white"
                        : "bg-cream-dark text-navy/40"
                  }`}
                >
                  {completed ? "\u2713" : ch.number}
                </div>
                <div>
                  <p className="text-sm font-medium">{ch.theme}</p>
                  <p className="text-xs text-navy/40">
                    {ch.wordCount} mots &middot; {ch.paragraphs.length} paragraphes
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  ch.difficulty === "A2"
                    ? "bg-sage/20 text-sage"
                    : "bg-gold/20 text-gold"
                }`}
              >
                {ch.difficulty}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
