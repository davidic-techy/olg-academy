import { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import api from '../../api/axios';

const QuizPlayer = ({ lesson, courseId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    
    // Check if correct (immediate feedback could go here, but we wait)
    if (optionIndex === lesson.questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }

    // Auto-advance after 1 second
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < lesson.questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    const finalScore = (score / lesson.questions.length) * 100;
    const passed = finalScore >= (lesson.passingScore || 70);
    
    if (passed) {
      try {
        await api.put(`/enrollments/${courseId}/progress`, { 
          lessonId: lesson._id,
          quizScore: finalScore
        });
        onComplete(); // Triggers the confetti in parent
      } catch (err) {
        console.error("Quiz Save Failed", err);
      }
    }
    setIsSubmitting(false);
  };

  if (showResult) {
    const percentage = Math.round((score / lesson.questions.length) * 100);
    const passed = percentage >= (lesson.passingScore || 70);

    return (
      <div className="h-[50vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {passed ? <CheckCircle size={48} /> : <XCircle size={48} />}
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">{passed ? "Quiz Passed!" : "Try Again"}</h2>
        <p className="text-slate-500 font-medium mb-8">You scored {percentage}% (Required: {lesson.passingScore || 70}%)</p>
        
        {passed ? (
          <button 
            onClick={submitQuiz}
            disabled={isSubmitting}
            className="px-8 py-4 bg-olg-blue text-white rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-olg-dark transition-all flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : "Continue Course"} <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => { setCurrentQuestion(0); setScore(0); setShowResult(false); setSelectedOption(null); }}
            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-black transition-all flex items-center gap-2"
          >
            <RotateCcw size={18} /> Retry Quiz
          </button>
        )}
      </div>
    );
  }

  const question = lesson.questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentQuestion + 1} / {lesson.questions.length}</span>
          <span className="bg-blue-50 text-olg-blue px-3 py-1 rounded-lg text-xs font-bold">Score: {score}</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-10 leading-tight">{question.questionText}</h3>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-bold text-lg flex justify-between items-center group
                ${selectedOption === index 
                  ? (index === question.correctAnswer ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                  : 'border-slate-100 hover:border-olg-blue hover:shadow-lg text-slate-600'
                }
              `}
            >
              <span className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${selectedOption === index ? 'border-current' : 'border-slate-300 text-slate-400'}`}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </span>
              {selectedOption === index && (
                index === question.correctAnswer ? <CheckCircle size={24} /> : <XCircle size={24} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;