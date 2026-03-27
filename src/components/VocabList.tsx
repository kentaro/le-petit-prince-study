"use client";

import { useState, useMemo } from "react";
import { Chapter, VocabEntry, Progress } from "@/lib/types";
import { speakFrench, isSpeechSupported } from "@/lib/speech";

const posLabels: Record<string, string> = {
  nom: "名詞",
  verbe: "動詞",
  adj: "形容詞",
  adv: "副詞",
  expr: "表現",
  "prép": "前置詞",
};

const posColors: Record<string, string> = {
  nom: "bg-periwinkle/20 text-periwinkle",
  verbe: "bg-sage/20 text-sage",
  adj: "bg-rose/20 text-rose",
  adv: "bg-lavender/20 text-lavender",
  expr: "bg-sand/20 text-sand",
  "prép": "bg-gold/20 text-gold",
};

interface DictEntry {
  pos: string;
  gender: string | null;
  japanese: string;
}

interface VocabListProps {
  chapters: Chapter[];
  dictionary: Record<string, DictEntry>;
  progress: Progress;
  onBack: () => void;
}

type FilterPos = "all" | "nom" | "verbe" | "adj" | "adv" | "expr" | "prép";
type FilterStatus = "all" | "known" | "reviewing" | "new";
type FilterSource = "all" | "chapter" | "dictionary";

export default function VocabList({
  chapters,
  dictionary,
  progress,
  onBack,
}: VocabListProps) {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState<FilterPos>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterSource, setFilterSource] = useState<FilterSource>("all");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  // Collect all unique vocabulary: chapter vocab + full dictionary
  const allVocab = useMemo(() => {
    const seen = new Set<string>();
    const result: (VocabEntry & { chapterNum: number | null; source: "chapter" | "dictionary" })[] = [];

    // 1. Chapter vocabulary (richer data with examples, CEFR)
    for (const ch of chapters) {
      for (const v of ch.vocabulary) {
        const key = v.french.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ ...v, chapterNum: ch.number, source: "chapter" });
        }
      }
    }

    // 2. Full dictionary entries not already covered
    for (const [word, entry] of Object.entries(dictionary)) {
      if (!seen.has(word)) {
        seen.add(word);
        result.push({
          french: word,
          pos: entry.pos as VocabEntry["pos"],
          gender: entry.gender as VocabEntry["gender"],
          japanese: entry.japanese,
          example: "",
          cefr: "A2",
          chapterNum: null,
          source: "dictionary",
        });
      }
    }

    return result;
  }, [chapters, dictionary]);

  const filtered = useMemo(() => {
    return allVocab.filter((v) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.french.toLowerCase().includes(q) &&
          !v.japanese.includes(q)
        ) {
          return false;
        }
      }
      // POS filter
      if (filterPos !== "all" && v.pos !== filterPos) return false;
      // Source filter
      if (filterSource !== "all" && v.source !== filterSource) return false;
      // Chapter filter
      if (selectedChapter !== null && v.chapterNum !== selectedChapter) return false;
      // Status filter
      const key = v.french.toLowerCase();
      const isKnown = progress.knownWords.includes(key);
      const isReviewing = !!progress.vocab[key];
      if (filterStatus === "known" && !isKnown) return false;
      if (filterStatus === "reviewing" && !isReviewing) return false;
      if (filterStatus === "new" && (isKnown || isReviewing)) return false;
      return true;
    });
  }, [allVocab, search, filterPos, filterStatus, filterSource, selectedChapter, progress]);

  const stats = useMemo(() => {
    const total = allVocab.length;
    const known = allVocab.filter((v) =>
      progress.knownWords.includes(v.french.toLowerCase())
    ).length;
    const reviewing = allVocab.filter((v) =>
      !!progress.vocab[v.french.toLowerCase()]
    ).length;
    return { total, known, reviewing };
  }, [allVocab, progress]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream/95 backdrop-blur border-b border-sand/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="tap-target text-navy/50 hover:text-navy">
            &larr;
          </button>
          <h2 className="text-sm font-medium">語彙一覧</h2>
          <div />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-2.5 text-center shadow-sm">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs text-navy/40">全語彙</p>
          </div>
          <div className="bg-sage/10 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-sage">{stats.known}</p>
            <p className="text-xs text-navy/40">習得済み</p>
          </div>
          <div className="bg-gold/10 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gold">{stats.reviewing}</p>
            <p className="text-xs text-navy/40">復習中</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索 (フランス語 / 日本語)..."
            className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-transparent focus:border-gold/30 outline-none text-sm shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {/* POS filter */}
          {(["all", "verbe", "nom", "adj", "adv", "expr", "prép"] as FilterPos[]).map(
            (pos) => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  filterPos === pos
                    ? "bg-navy text-white"
                    : "bg-cream-dark text-navy/50"
                }`}
              >
                {pos === "all" ? "全品詞" : posLabels[pos] || pos}
              </button>
            )
          )}
        </div>

        <div className="flex gap-1.5 mb-4">
          {(["all", "known", "reviewing", "new"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  filterStatus === status
                    ? "bg-navy text-white"
                    : "bg-cream-dark text-navy/50"
                }`}
              >
                {status === "all"
                  ? "全て"
                  : status === "known"
                    ? "習得済み"
                    : status === "reviewing"
                      ? "復習中"
                      : "未学習"}
              </button>
            )
          )}
        </div>

        <div className="flex gap-1.5 mb-4">
          {(["all", "chapter", "dictionary"] as FilterSource[]).map(
            (source) => (
              <button
                key={source}
                onClick={() => setFilterSource(source)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  filterSource === source
                    ? "bg-navy text-white"
                    : "bg-cream-dark text-navy/50"
                }`}
              >
                {source === "all"
                  ? "全ソース"
                  : source === "chapter"
                    ? "章の語彙"
                    : "辞書"}
              </button>
            )
          )}
        </div>

        {/* Chapter filter */}
        <div className="mb-4">
          <select
            value={selectedChapter ?? ""}
            onChange={(e) =>
              setSelectedChapter(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-3 py-2 rounded-xl bg-white text-sm outline-none shadow-sm"
          >
            <option value="">全チャプター</option>
            {chapters.map((ch) => (
              <option key={ch.number} value={ch.number}>
                Ch. {ch.number} &mdash; {ch.theme}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-navy/40 mb-3">
          {filtered.length} 件
        </p>

        {/* Vocab list */}
        <div className="space-y-1.5">
          {filtered.map((v) => {
            const key = v.french.toLowerCase();
            const isKnown = progress.knownWords.includes(key);
            const srsCard = progress.vocab[key];

            return (
              <div
                key={key}
                className={`bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 ${
                  isKnown ? "opacity-70" : ""
                }`}
              >
                {/* Speak button */}
                {isSpeechSupported() && (
                  <button
                    onClick={() => speakFrench(v.french, 0.7)}
                    className="text-navy/30 hover:text-gold transition-colors flex-shrink-0"
                  >
                    {"\uD83D\uDD0A"}
                  </button>
                )}

                {/* Word info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-serif)] font-medium">
                      {v.french}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        posColors[v.pos] || "bg-cream-dark text-navy/40"
                      }`}
                    >
                      {posLabels[v.pos] || v.pos}
                    </span>
                    {v.gender && (
                      <span className="text-xs text-navy/30">
                        {v.gender === "m" ? "m." : "f."}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-navy/60 truncate">{v.japanese}</p>
                </div>

                {/* Status indicators */}
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <span className="text-xs text-gold/60">{v.cefr}</span>
                  {isKnown && (
                    <span className="text-sage text-sm">{"\u2713"}</span>
                  )}
                  {srsCard && (
                    <span className="text-xs text-navy/30">
                      {srsCard.repetitions}回
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy/30 text-sm">該当する語彙がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
