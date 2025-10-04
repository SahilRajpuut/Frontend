// src/components/QuizInterface.jsx - New dedicated quiz component
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChevronRight, ChevronLeft, CheckCircle, 
  XCircle, Award, RefreshCw, BookOpen, Brain,
  TrendingUp, Target, Zap
} from 'lucide-react';

const QuizInterface = ({ quiz, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      // Calculate score
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      
      setScore(correctCount);
      
      // Save to backend
      const response = await fetch(`/api/quiz/${quiz.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('noteflow_token')}`
        },
        body: JSON.stringify({
          answers: Object.values(selectedAnswers),
          time_taken: timeElapsed
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((Object.keys(selectedAnswers).length / quiz.questions.length) * 100).toFixed(0);

  if (showResults) {
    const percentage = ((score / quiz.questions.length) * 100).toFixed(1);
    
    return (
      <motion.div 
        className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="bg-black border border-purple-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Results Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 text-center border-b border-purple-500/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {percentage >= 80 ? (
                <Award className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
              ) : percentage >= 60 ? (
                <TrendingUp className="w-20 h-20 mx-auto text-green-400 mb-4" />
              ) : (
                <Target className="w-20 h-20 mx-auto text-blue-400 mb-4" />
              )}
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {percentage}%
            </p>
            <p className="text-gray-300 mt-2">
              You got {score} out of {quiz.questions.length} questions correct
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Time: {formatTime(timeElapsed)}
            </p>
          </div>

          {/* Detailed Results */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <h3 className="text-xl font-bold text-white mb-4">Review Your Answers</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      isCorrect ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          {idx + 1}. {question.question}
                        </p>
                        <p className="text-sm text-gray-300 mb-1">
                          Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                            {question.options[userAnswer]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-400 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        {question.explanation && (
                          <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold text-purple-400">Explanation:</span> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              Back to Notes
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="bg-black border border-purple-500/30 rounded-3xl max-w-4xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {quiz.questions[currentQuestion].question}
              </h3>
              
              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedAnswers[currentQuestion] === idx
                        ? 'bg-purple-900/30 border-purple-500 text-white'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === idx
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-600'
                      }`}>
                        {selectedAnswers[currentQuestion] === idx && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all flex items-center space-x-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentQuestion
                    ? 'bg-purple-600 text-white'
                    : selectedAnswers[idx] !== undefined
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== quiz.questions.length || submitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizInterface;