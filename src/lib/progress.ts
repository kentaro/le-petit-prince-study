import { Progress, SRSCard } from "./types";

const STORAGE_KEY = "lpp-progress";

const defaultProgress: Progress = {
  currentChapter: 1,
  streak: 0,
  lastStudyDate: "",
  vocab: {},
  knownWords: [],
  completedChapters: [],
  conjugationScores: {},
  totalWordsLearned: 0,
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(stored) };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(progress: Progress): Progress {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (progress.lastStudyDate === today) return progress;

  const newStreak =
    progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak: newStreak, lastStudyDate: today };
}

// SM-2 Spaced Repetition Algorithm
export function reviewCard(
  card: SRSCard,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): SRSCard {
  const today = new Date().toISOString().slice(0, 10);

  let { interval, easeFactor, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date(
    Date.now() + interval * 86400000
  ).toISOString().slice(0, 10);

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lastReview: today,
  };
}

export function createSRSCard(word: string): SRSCard {
  return {
    word,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString().slice(0, 10),
    lastReview: "",
  };
}

export function getDueCards(progress: Progress): SRSCard[] {
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(progress.vocab).filter(
    (card) => card.nextReview <= today
  );
}
