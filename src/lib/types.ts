export interface VocabEntry {
  french: string;
  pos: "nom" | "verbe" | "adj" | "adv" | "expr" | "prép";
  gender: "m" | "f" | null;
  japanese: string;
  example: string;
  cefr: "A1" | "A2" | "B1" | "B2";
}

export interface GrammarExample {
  french: string;
  breakdown: string;
  japanese: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface ConjugationDrill {
  verb: string;
  meaning: string;
  group: 1 | 2 | 3;
  tense: string;
  forms: {
    je: string;
    tu: string;
    il: string;
    nous: string;
    vous: string;
    ils: string;
  };
  contextSentence: string;
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
  questionJa: string;
  answerJa: string;
}

export interface SentenceTranslation {
  french: string;
  japanese: string;
}

export interface Chapter {
  number: number;
  title: string;
  theme: string;
  difficulty: "A2" | "B1";
  paragraphs: string[];
  wordCount: number;
  sentenceCount: number;
  vocabulary: VocabEntry[];
  grammar: GrammarPoint[];
  conjugations: ConjugationDrill[];
  comprehension: ComprehensionQuestion[];
  sentenceTranslations: SentenceTranslation[];
}

export interface SRSCard {
  word: string;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  nextReview: string; // ISO date
  lastReview: string;
}

export interface Progress {
  currentChapter: number;
  streak: number;
  lastStudyDate: string;
  vocab: Record<string, SRSCard>;
  knownWords: string[];
  completedChapters: number[];
  conjugationScores: Record<string, number>;
  totalWordsLearned: number;
}

export type ViewMode = "reading" | "vocab" | "conjugation" | "comprehension" | "home";
