"use client";

import { useState, useMemo, useCallback } from "react";
import { Chapter, VocabEntry, SentenceTranslation } from "@/lib/types";
import WordPopup from "./WordPopup";
import GrammarPanel from "./GrammarPanel";

interface ReadingViewProps {
  chapter: Chapter;
  knownWords: string[];
  onWordTap: (entry: VocabEntry) => void;
  onMarkKnown: (word: string) => void;
  onAddToReview: (word: string) => void;
  onChapterComplete: () => void;
  onBack: () => void;
}

export default function ReadingView({
  chapter,
  knownWords,
  onWordTap,
  onMarkKnown,
  onAddToReview,
  onChapterComplete,
  onBack,
}: ReadingViewProps) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<VocabEntry | null>(null);
  const [showTranslation, setShowTranslation] = useState<string | null>(null);
  const [showGrammar, setShowGrammar] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);

  const paragraph = chapter.paragraphs[paragraphIndex] || "";
  const totalParagraphs = chapter.paragraphs.length;
  const progressPct = ((paragraphIndex + 1) / totalParagraphs) * 100;

  // Build a lookup map for vocabulary words
  const vocabMap = useMemo(() => {
    const map = new Map<string, VocabEntry>();
    for (const v of chapter.vocabulary) {
      map.set(v.french.toLowerCase(), v);
    }
    return map;
  }, [chapter.vocabulary]);

  // Build sentence translation map
  const translationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of chapter.sentenceTranslations || []) {
      // Normalize: trim and lowercase first few chars for matching
      const key = t.french.trim().toLowerCase().slice(0, 60);
      map.set(key, t.japanese);
    }
    return map;
  }, [chapter.sentenceTranslations]);

  const findTranslation = useCallback(
    (sentence: string): string | null => {
      const key = sentence.trim().toLowerCase().slice(0, 60);
      for (const [k, v] of translationMap) {
        if (key.startsWith(k.slice(0, 30)) || k.startsWith(key.slice(0, 30))) {
          return v;
        }
      }
      return null;
    },
    [translationMap]
  );

  // Split paragraph into sentences for tap-to-translate
  const sentences = useMemo(() => {
    return paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
  }, [paragraph]);

  const handleWordClick = (word: string) => {
    const cleaned = word.toLowerCase().replace(/[.,;:!?«»"'()\-–—]/g, "");
    const entry = vocabMap.get(cleaned);
    if (entry) {
      setSelectedWord(entry);
      onWordTap(entry);
    }
  };

  const handleSentenceClick = (sentence: string) => {
    const translation = findTranslation(sentence);
    if (translation) {
      setShowTranslation(
        showTranslation === translation ? null : translation
      );
    }
  };

  const goNext = () => {
    if (paragraphIndex < totalParagraphs - 1) {
      setParagraphIndex((i) => i + 1);
      setShowTranslation(null);
    } else {
      onChapterComplete();
    }
  };

  const goPrev = () => {
    if (paragraphIndex > 0) {
      setParagraphIndex((i) => i - 1);
      setShowTranslation(null);
    }
  };

  const renderWord = (word: string, idx: number) => {
    const cleaned = word.toLowerCase().replace(/[.,;:!?«»"'()\-–—]/g, "");
    const entry = vocabMap.get(cleaned);
    const isKnown = knownWords.includes(cleaned);

    let className = "cursor-pointer hover:bg-gold/20 rounded px-0.5 transition-colors";
    if (entry && highlightMode) {
      const posClass: Record<string, string> = {
        verbe: "bg-sage/15",
        nom: "bg-periwinkle/15",
        adj: "bg-rose/15",
        adv: "bg-lavender/15",
        expr: "bg-sand/15",
      };
      className += " " + (posClass[entry.pos] || "");
    }
    if (entry && isKnown) {
      className += " opacity-50";
    }
    if (entry) {
      className += " underline decoration-dotted decoration-gold/40 underline-offset-4";
    }

    return (
      <span
        key={idx}
        className={className}
        onClick={() => handleWordClick(word)}
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

        {/* French text */}
        <div className="french-text mb-4">
          {sentences.map((sentence, sIdx) => (
            <span
              key={sIdx}
              className="cursor-pointer hover:bg-gold/10 rounded transition-colors"
              onClick={() => handleSentenceClick(sentence)}
            >
              {sentence.split(/\s+/).map((word, wIdx) =>
                renderWord(word, sIdx * 1000 + wIdx)
              )}
            </span>
          ))}
        </div>

        {/* Sentence translation (tap to reveal) */}
        {showTranslation && (
          <div className="bg-cream-dark rounded-xl p-3 mb-4 fade-in">
            <p className="text-sm text-navy/70">{showTranslation}</p>
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

          <div className="flex gap-2">
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
