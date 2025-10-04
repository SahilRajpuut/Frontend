// src/components/QuizHistory.jsx - New component
import React, { useState, useEffect } from 'react';
import { Trophy, Clock, TrendingUp, Brain } from 'lucide-react';

const QuizHistory = ({ userId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('noteflow_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading quiz history...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
        <Brain className="w-6 h-6 text-purple-400" />
        <span>Your Quiz History</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(quiz => (
          <div 
            key={quiz.id}
            className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-pointer"
            onClick={() => window.openQuiz(quiz.id)}
          >
            <h3 className="font-bold text-white mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{quiz.topic}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-green-400">
                <Trophy className="w-4 h-4" />
                <span>{quiz.best_score.toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span>{quiz.total_attempts} attempts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizHistory;