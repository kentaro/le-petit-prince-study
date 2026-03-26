"use client";

import { useState, useMemo, useCallback } from "react";
import { Chapter, VocabEntry } from "@/lib/types";
import WordPopup from "./WordPopup";
import GrammarPanel from "./GrammarPanel";

interface DictEntry {
  pos: string;
  gender: string | null;
  japanese: string;
}

interface ReadingViewProps {
  chapter: Chapter;
  dictionary: Record<string, DictEntry>;
  knownWords: string[];
  onWordTap: (entry: VocabEntry) => void;
  onMarkKnown: (word: string) => void;
  onAddToReview: (word: string) => void;
  onChapterComplete: () => void;
  onBack: () => void;
}

function cleanWord(word: string): string {
  return word.toLowerCase().replace(/[.,;:!?«»"'()\-–—\n\r]/g, "").trim();
}

export default function ReadingView({
  chapter,
  dictionary,
  knownWords,
  onWordTap,
  onMarkKnown,
  onAddToReview,
  onChapterComplete,
  onBack,
}: ReadingViewProps) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<VocabEntry | null>(null);
  const [showGrammar, setShowGrammar] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  const paragraph = chapter.paragraphs[paragraphIndex] || "";
  const totalParagraphs = chapter.paragraphs.length;
  const progressPct = ((paragraphIndex + 1) / totalParagraphs) * 100;

  // Build a lookup map for chapter vocabulary (richer data with examples)
  const vocabMap = useMemo(() => {
    const map = new Map<string, VocabEntry>();
    for (const v of chapter.vocabulary) {
      // Strip leading articles for matching: "la forêt" → "forêt", "le serpent" → "serpent"
      const key = v.french.toLowerCase().replace(/^(le |la |l'|les |un |une |des )/, "");
      map.set(key, v);
      // Also add the full form
      map.set(v.french.toLowerCase(), v);
    }
    return map;
  }, [chapter.vocabulary]);

  // Normalize text for matching: strip newlines, collapse spaces, lowercase
  const normalize = (s: string) =>
    s.replace(/\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

  // Build sentence translation map with normalized keys
  const translationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of chapter.sentenceTranslations || []) {
      map.set(normalize(t.french), t.japanese);
    }
    return map;
  }, [chapter.sentenceTranslations]);

  const findTranslation = useCallback(
    (sentence: string): string | null => {
      const key = normalize(sentence);
      // Exact match
      for (const [k, v] of translationMap) {
        if (k === key) return v;
      }
      // Fuzzy: first 25 chars match
      for (const [k, v] of translationMap) {
        if (
          key.slice(0, 25) === k.slice(0, 25) ||
          k.includes(key.slice(0, 30)) ||
          key.includes(k.slice(0, 30))
        ) {
          return v;
        }
      }
      return null;
    },
    [translationMap]
  );

  // Collect all translations for the current paragraph
  const paragraphTranslations = useMemo(() => {
    const results: { french: string; japanese: string }[] = [];
    for (const t of chapter.sentenceTranslations || []) {
      const normPara = normalize(paragraph);
      const normFr = normalize(t.french);
      // Check if this translation's source sentence appears in this paragraph
      if (
        normPara.includes(normFr.slice(0, 30)) ||
        normFr.includes(normPara.slice(0, 30))
      ) {
        results.push({ french: t.french, japanese: t.japanese });
      }
    }
    return results;
  }, [paragraph, chapter.sentenceTranslations]);

  // Split paragraph into sentences
  const sentences = useMemo(() => {
    const normalized = paragraph.replace(/\n/g, " ");
    return normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  }, [paragraph]);

  // Look up a word: first in chapter vocab, then in full dictionary
  const lookupWord = useCallback(
    (raw: string): VocabEntry | null => {
      const cleaned = cleanWord(raw);
      if (!cleaned) return null;

      // 1. Check chapter vocabulary (has examples, CEFR, etc.)
      const fromVocab = vocabMap.get(cleaned);
      if (fromVocab) return fromVocab;

      // 2. Check full dictionary
      const dictEntry = dictionary[cleaned];
      if (dictEntry) {
        return {
          french: cleaned,
          pos: dictEntry.pos as VocabEntry["pos"],
          gender: dictEntry.gender as VocabEntry["gender"],
          japanese: dictEntry.japanese,
          example: "",
          cefr: "A2",
        };
      }

      return null;
    },
    [vocabMap, dictionary]
  );

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); // Prevent sentence click from firing
    const entry = lookupWord(word);
    if (entry) {
      setSelectedWord(entry);
      onWordTap(entry);
    }
  };

  const goNext = () => {
    if (paragraphIndex < totalParagraphs - 1) {
      setParagraphIndex((i) => i + 1);
      setShowGrammar(false);
    } else {
      onChapterComplete();
    }
  };

  const goPrev = () => {
    if (paragraphIndex > 0) {
      setParagraphIndex((i) => i - 1);
      setShowGrammar(false);
    }
  };

  const renderWord = (word: string, idx: number) => {
    const cleaned = cleanWord(word);
    const entry = lookupWord(word);
    const isChapterVocab = vocabMap.has(cleaned);
    const isKnown = knownWords.includes(cleaned);

    let className = "cursor-pointer rounded px-0.5 transition-colors";

    // All tappable words get hover effect
    if (entry) {
      className += " hover:bg-gold/20";
    }

    // POS highlight mode (only for words we know the POS of)
    if (entry && highlightMode) {
      const posClass: Record<string, string> = {
        verbe: "bg-sage/30 text-[#1a5c28]",
        nom: "bg-periwinkle/30 text-[#3a4a8a]",
        adj: "bg-rose/30 text-[#8a3a55]",
        adv: "bg-lavender/30 text-[#5a3a8a]",
        expr: "bg-sand/30 text-[#7a5a2d]",
        "prép": "bg-gold/20 text-[#8a6a1a]",
        pron: "bg-cream-dark text-navy/70",
        "dét": "bg-cream-dark text-navy/50",
        conj: "bg-cream-dark text-navy/50",
      };
      className += " rounded-sm py-0.5 " + (posClass[entry.pos] || "");
    }

    // Known words are dimmed
    if (isKnown) {
      className += " opacity-50";
    }

    // Chapter vocabulary words get dotted underline
    if (isChapterVocab) {
      className += " underline decoration-dotted decoration-gold/60 underline-offset-4";
    } else if (entry) {
      // Dictionary words get subtle underline
      className += " underline decoration-dotted decoration-navy/20 underline-offset-4";
    }

    return (
      <span
        key={idx}
        className={className}
        onClick={(e) => handleWordClick(e, word)}
      >
        {word}{" "}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream/95 backdrop-blur border-b border-sand/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="tap-target text-navy/50 hover:text-navy">
            &larr;
          </button>
          <div className="text-center">
            <p className="text-xs text-navy/50">
              Chapitre {chapter.number}/27
            </p>
            <p className="text-sm font-medium">{chapter.theme}</p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              chapter.difficulty === "A2"
                ? "bg-sage/20 text-sage"
                : "bg-gold/20 text-gold"
            }`}
          >
            {chapter.difficulty}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-cream-dark">
          <div
            className="h-full bg-gold progress-fill rounded-r-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Paragraph counter */}
        <p className="text-xs text-navy/30 mb-4">
          {paragraphIndex + 1} / {totalParagraphs}
        </p>

        {/* French text with inline translations */}
        <div className="french-text mb-4">
          {sentences.map((sentence, sIdx) => {
            const translation = showAllTranslations
              ? findTranslation(sentence)
              : null;
            return (
              <span key={sIdx}>
                <span>
                  {sentence.split(/\s+/).map((word, wIdx) =>
                    renderWord(word, sIdx * 1000 + wIdx)
                  )}
                </span>
                {translation && (
                  <span className="block text-sm text-navy/50 ml-1 mb-2 pl-3 border-l-2 border-gold/30 fade-in">
                    {translation}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Fallback: show paragraph-level translations if no inline matches found */}
        {showAllTranslations &&
          sentences.every((s) => !findTranslation(s)) &&
          paragraphTranslations.length > 0 && (
            <div className="bg-cream-dark rounded-xl p-3 mb-4 fade-in">
              <p className="text-xs text-navy/40 mb-2">この段落の翻訳</p>
              {paragraphTranslations.map((t, i) => (
                <p key={i} className="text-sm text-navy/60 mb-1 last:mb-0">
                  {t.japanese}
                </p>
              ))}
            </div>
          )}

        {/* Grammar section */}
        {showGrammar && chapter.grammar.length > 0 && (
          <GrammarPanel grammar={chapter.grammar} />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="sticky bottom-0 bg-cream/95 backdrop-blur border-t border-sand/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={paragraphIndex === 0}
            className="tap-target px-4 py-2 rounded-xl text-sm font-medium bg-cream-dark hover:bg-sand/20 disabled:opacity-30 transition-colors"
          >
            &larr; 前
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={() => setShowAllTranslations(!showAllTranslations)}
              className={`tap-target px-3 py-2 rounded-xl text-xs transition-colors ${
                showAllTranslations
                  ? "bg-gold/20 text-gold"
                  : "bg-cream-dark text-navy/50"
              }`}
            >
              訳
            </button>
            <button
              onClick={() => setHighlightMode(!highlightMode)}
              className={`tap-target px-3 py-2 rounded-xl text-xs transition-colors ${
                highlightMode
                  ? "bg-sage/20 text-sage"
                  : "bg-cream-dark text-navy/50"
              }`}
            >
              品詞
            </button>
            <button
              onClick={() => setShowGrammar(!showGrammar)}
              className={`tap-target px-3 py-2 rounded-xl text-xs transition-colors ${
                showGrammar
                  ? "bg-periwinkle/20 text-periwinkle"
                  : "bg-cream-dark text-navy/50"
              }`}
            >
              文法
            </button>
          </div>

          <button
            onClick={goNext}
            className="tap-target px-4 py-2 rounded-xl text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors"
          >
            {paragraphIndex === totalParagraphs - 1 ? "完了 !" : "次 \u2192"}
          </button>
        </div>
      </nav>

      {/* Word popup */}
      {selectedWord && (
        <WordPopup
          entry={selectedWord}
          isKnown={knownWords.includes(selectedWord.french.toLowerCase())}
          onMarkKnown={() => {
            onMarkKnown(selectedWord.french.toLowerCase());
            setSelectedWord(null);
          }}
          onAddToReview={() => {
            onAddToReview(selectedWord.french.toLowerCase());
            setSelectedWord(null);
          }}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
