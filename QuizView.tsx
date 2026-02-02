
import React, { useState } from 'react';
import { QuizQuestion } from './types';
import { useI18n } from './i18n';
import BannerAd from './BannerAd';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  language: string;
  isPremium: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, language, isPremium }) => {
  const { t } = useI18n(language);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === question.correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
          {score}/{questions.length}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('quiz.completed')}</h3>
        <p className="text-slate-600 mb-6">
          {score === questions.length 
            ? "Perfect! You've mastered this topic." 
            : score > questions.length / 2 
              ? "Good job! Keep reviewing to bridge the gaps." 
              : "Review the topic again to improve your understanding."}
        </p>
        <BannerAd isPremium={isPremium} type="fluid" className="mb-6" />
        <button 
          onClick={onComplete}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Back to Lesson
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
        {question.question}
      </h3>

      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => {
          let styles = "w-full text-left p-4 rounded-xl border-2 transition-all ";
          if (isAnswered) {
            if (idx === question.correctAnswerIndex) styles += "border-green-500 bg-green-50 text-green-700";
            else if (selectedOption === idx) styles += "border-red-500 bg-red-50 text-red-700";
            else styles += "border-slate-100 text-slate-400";
          } else {
            styles += selectedOption === idx 
              ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
              : "border-slate-100 hover:border-indigo-300 text-slate-700";
          }

          return (
            <button key={idx} onClick={() => handleSelect(idx)} className={styles}>
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 text-xs font-bold uppercase">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
          <p className="text-sm font-semibold text-indigo-600 mb-1">Explanation:</p>
          <p className="text-sm text-slate-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex justify-end pb-10">
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {t('quiz.check')}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center"
          >
            {currentIdx === questions.length - 1 ? t('quiz.finish') : t('quiz.next')}
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        )}
      </div>
      
      {/* Mobile Spacer to prevent overlap with navbar */}
      <div className="h-12 md:hidden"></div>
    </div>
  );
};

export default QuizView;
