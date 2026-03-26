"use client";

import { useState } from "react";
import { ComprehensionQuestion } from "@/lib/types";

interface ComprehensionQuizProps {
  questions: ComprehensionQuestion[];
  onComplete: () => void;
}

export default function ComprehensionQuiz({
  questions,
  onComplete,
}: ComprehensionQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const q = questions[currentIdx];
  if (!q) return null;

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full">
      <p className="text-center text-xs text-navy/40 mb-4">
        {currentIdx + 1} / {questions.length}
      </p>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Question in French */}
        <p className="font-[family-name:var(--font-serif)] text-lg leading-relaxed mb-2">
          {q.question}
        </p>
        <p className="text-sm text-navy/50 mb-6">{q.questionJa}</p>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full tap-target bg-gold/10 hover:bg-gold/20 text-gold rounded-xl py-3 text-sm font-medium transition-colors"
          >
            答えを見る
          </button>
        ) : (
          <div className="fade-in">
            <div className="bg-sage/10 rounded-xl p-4 mb-4">
              <p className="font-[family-name:var(--font-serif)] text-base font-medium mb-1">
                {q.answer}
              </p>
              <p className="text-sm text-navy/60">{q.answerJa}</p>
            </div>
            <button
              onClick={handleNext}
              className="w-full tap-target bg-gold text-white hover:bg-gold/90 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {currentIdx < questions.length - 1 ? "次の問題" : "完了"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
