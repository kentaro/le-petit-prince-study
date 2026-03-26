"use client";

import { useState, useEffect, useCallback } from "react";
import { Chapter, VocabEntry, Progress } from "@/lib/types";
import {
  loadProgress,
  saveProgress,
  updateStreak,
  createSRSCard,
  reviewCard,
  getDueCards,
} from "@/lib/progress";
import HomeView from "./HomeView";
import ReadingView from "./ReadingView";
import FlashCard from "./FlashCard";
import ConjugationDrill from "./ConjugationDrill";
import ComprehensionQuiz from "./ComprehensionQuiz";
import VocabList from "./VocabList";
import ChapterSummary from "./ChapterSummary";

interface DictEntry {
  pos: string;
  gender: string | null;
  japanese: string;
}

interface AppProps {
  chapters: Chapter[];
  dictionary: Record<string, DictEntry>;
}

type SubView = "reading" | "flashcard" | "conjugation" | "comprehension" | "summary";

export default function App({ chapters, dictionary }: AppProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [view, setView] = useState<"home" | "chapter" | "vocabList">("home");
  const [subView, setSubView] = useState<SubView>("reading");
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [flashCardIdx, setFlashCardIdx] = useState(0);
  const [drillIdx, setDrillIdx] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const p = loadProgress();
    const updated = updateStreak(p);
    setProgress(updated);
    saveProgress(updated);
  }, []);

  const chapter = chapters[activeChapter - 1];

  const save = useCallback(
    (updater: (prev: Progress) => Progress) => {
      setProgress((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const handleStartReading = (chapterNum: number) => {
    setActiveChapter(chapterNum);
    setSubView("reading");
    setView("chapter");
    save((p) => ({ ...p, currentChapter: chapterNum }));
  };

  const handleStartReview = () => {
    setReviewMode(true);
    setFlashCardIdx(0);
    setView("chapter");
    setSubView("flashcard");
  };

  const handleWordTap = (_entry: VocabEntry) => {
    // Track tapped words for analytics if needed
  };

  const handleMarkKnown = (word: string) => {
    save((p) => ({
      ...p,
      knownWords: p.knownWords.includes(word)
        ? p.knownWords
        : [...p.knownWords, word],
      totalWordsLearned: p.knownWords.includes(word)
        ? p.totalWordsLearned
        : p.totalWordsLearned + 1,
    }));
  };

  const handleAddToReview = (word: string) => {
    save((p) => ({
      ...p,
      vocab: {
        ...p.vocab,
        [word]: p.vocab[word] || createSRSCard(word),
      },
    }));
  };

  const handleChapterComplete = () => {
    // Move to vocab review for this chapter
    setFlashCardIdx(0);
    setSubView("flashcard");
    setReviewMode(false);
  };

  const handleFlashcardRate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (reviewMode && progress) {
      // Review mode - go through due cards
      const dueCards = getDueCards(progress);
      const card = dueCards[flashCardIdx];
      if (card) {
        save((p) => ({
          ...p,
          vocab: {
            ...p.vocab,
            [card.word]: reviewCard(card, quality),
          },
        }));
      }
      if (flashCardIdx < dueCards.length - 1) {
        setFlashCardIdx((i) => i + 1);
      } else {
        setReviewMode(false);
        setView("home");
      }
      return;
    }

    // Chapter vocab review
    const vocab = chapter?.vocabulary || [];
    if (flashCardIdx < vocab.length - 1) {
      setFlashCardIdx((i) => i + 1);
    } else {
      // Move to conjugation drills
      setDrillIdx(0);
      if (chapter?.conjugations?.length) {
        setSubView("conjugation");
      } else if (chapter?.comprehension?.length) {
        setSubView("comprehension");
      } else {
        finishChapter();
      }
    }

    // Add to SRS
    const word = vocab[flashCardIdx]?.french.toLowerCase();
    if (word) {
      save((p) => {
        const existing = p.vocab[word];
        const card = existing || createSRSCard(word);
        return {
          ...p,
          vocab: { ...p.vocab, [word]: reviewCard(card, quality) },
        };
      });
    }
  };

  const handleDrillComplete = (score: number) => {
    const verb = chapter?.conjugations?.[drillIdx]?.verb;
    if (verb) {
      save((p) => ({
        ...p,
        conjugationScores: { ...p.conjugationScores, [verb]: score },
      }));
    }

    const drills = chapter?.conjugations || [];
    if (drillIdx < drills.length - 1) {
      setDrillIdx((i) => i + 1);
    } else if (chapter?.comprehension?.length) {
      setSubView("comprehension");
    } else {
      finishChapter();
    }
  };

  const handleComprehensionComplete = () => {
    finishChapter();
  };

  const finishChapter = () => {
    save((p) => ({
      ...p,
      completedChapters: p.completedChapters.includes(activeChapter)
        ? p.completedChapters
        : [...p.completedChapters, activeChapter],
      currentChapter: Math.min(activeChapter + 1, 27),
    }));
    setSubView("summary");
  };

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gold text-3xl mb-2">☆</p>
          <p className="text-navy/40 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (view === "home") {
    return (
      <HomeView
        chapters={chapters}
        progress={progress}
        onStartReading={handleStartReading}
        onStartReview={handleStartReview}
        onShowVocabList={() => setView("vocabList")}
      />
    );
  }

  if (view === "vocabList") {
    return (
      <VocabList
        chapters={chapters}
        progress={progress}
        onBack={() => setView("home")}
      />
    );
  }

  // Chapter view
  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-navy/40">Chapter not found</p>
      </div>
    );
  }

  if (subView === "reading") {
    return (
      <ReadingView
        chapter={chapter}
        dictionary={dictionary}
        knownWords={progress.knownWords}
        onWordTap={handleWordTap}
        onMarkKnown={handleMarkKnown}
        onAddToReview={handleAddToReview}
        onChapterComplete={handleChapterComplete}
        onBack={() => setView("home")}
      />
    );
  }

  if (subView === "flashcard") {
    if (reviewMode) {
      const dueCards = getDueCards(progress);
      if (dueCards.length === 0) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <p className="text-sage text-3xl mb-2">✓</p>
            <p className="text-lg font-medium mb-1">復習完了!</p>
            <p className="text-sm text-navy/50 mb-4">
              今日の復習カードはすべて終わりました
            </p>
            <button
              onClick={() => setView("home")}
              className="tap-target bg-gold text-white rounded-xl px-6 py-3 text-sm font-medium"
            >
              ホームに戻る
            </button>
          </div>
        );
      }
      const card = dueCards[flashCardIdx];
      // Find the vocab entry for this card
      const entry = chapters
        .flatMap((ch) => ch.vocabulary || [])
        .find((v) => v.french.toLowerCase() === card.word);
      if (!entry) {
        // Skip this card
        handleFlashcardRate(3);
        return null;
      }
      return (
        <div className="min-h-screen flex flex-col px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => { setReviewMode(false); setView("home"); }}
              className="tap-target text-navy/50"
            >
              &larr; 戻る
            </button>
            <h2 className="text-sm font-medium">復習</h2>
            <div />
          </div>
          <FlashCard
            entry={entry}
            card={card}
            onRate={handleFlashcardRate}
            current={flashCardIdx + 1}
            total={dueCards.length}
          />
        </div>
      );
    }

    // Chapter vocabulary review
    const vocab = chapter.vocabulary || [];
    if (vocab.length === 0) {
      handleChapterComplete();
      return null;
    }
    const entry = vocab[flashCardIdx];
    if (!entry) {
      setSubView("conjugation");
      return null;
    }
    const card =
      progress.vocab[entry.french.toLowerCase()] ||
      createSRSCard(entry.french.toLowerCase());
    return (
      <div className="min-h-screen flex flex-col px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView("home")}
            className="tap-target text-navy/50"
          >
            &larr; 戻る
          </button>
          <h2 className="text-sm font-medium">
            Ch. {chapter.number} &mdash; Vocabulaire
          </h2>
          <button
            onClick={() => {
              if (chapter.conjugations?.length) {
                setDrillIdx(0);
                setSubView("conjugation");
              } else {
                finishChapter();
              }
            }}
            className="text-xs text-navy/40"
          >
            スキップ
          </button>
        </div>
        <FlashCard
          entry={entry}
          card={card}
          onRate={handleFlashcardRate}
          current={flashCardIdx + 1}
          total={vocab.length}
        />
      </div>
    );
  }

  if (subView === "conjugation") {
    const drills = chapter.conjugations || [];
    if (drills.length === 0) {
      if (chapter.comprehension?.length) {
        setSubView("comprehension");
        return null;
      }
      finishChapter();
      return null;
    }
    const drill = drills[drillIdx];
    if (!drill) {
      finishChapter();
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView("home")}
            className="tap-target text-navy/50"
          >
            &larr; 戻る
          </button>
          <h2 className="text-sm font-medium">
            Ch. {chapter.number} &mdash; Conjugaison
          </h2>
          <button
            onClick={() => {
              if (chapter.comprehension?.length) {
                setSubView("comprehension");
              } else {
                finishChapter();
              }
            }}
            className="text-xs text-navy/40"
          >
            スキップ
          </button>
        </div>
        <ConjugationDrill
          drill={drill}
          onComplete={handleDrillComplete}
          current={drillIdx + 1}
          total={drills.length}
        />
      </div>
    );
  }

  if (subView === "comprehension") {
    const questions = chapter.comprehension || [];
    if (questions.length === 0) {
      finishChapter();
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView("home")}
            className="tap-target text-navy/50"
          >
            &larr; 戻る
          </button>
          <h2 className="text-sm font-medium">
            Ch. {chapter.number} &mdash; Compréhension
          </h2>
          <button
            onClick={finishChapter}
            className="text-xs text-navy/40"
          >
            スキップ
          </button>
        </div>
        <ComprehensionQuiz
          questions={questions}
          onComplete={handleComprehensionComplete}
        />
      </div>
    );
  }

  if (subView === "summary") {
    return (
      <ChapterSummary
        chapter={chapter}
        progress={progress}
        onContinue={() => setView("home")}
      />
    );
  }

  return null;
}
