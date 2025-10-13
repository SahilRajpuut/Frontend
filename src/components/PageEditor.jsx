// src/components/PageEditor.jsx - COMPLETE WITH ALL FEATURES
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  ArrowLeft, Lightbulb, MessageCircle, Brain, X, Send,
  Loader2, BookOpen, Trophy, RefreshCw, FileText, Sparkles, 
  Zap, CheckCircle, AlertCircle, Target, GraduationCap, History, 
  TrendingUp, Layout
} from 'lucide-react';

// Import hooks
import { useNote } from '../hooks/useNote';
import { useAI } from '../hooks/useAI';
import { useWebSocket } from '../hooks/useWebSocket';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('noteflow_token');

// Helper to make authenticated API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = getAuthToken();
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
};

// Quiz Modal Component with Attempt History
const QuizModal = ({ quiz, onClose, onRetry, showHistory = false }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewMode, setViewMode] = useState('quiz');

  useEffect(() => {
    if (showHistory) {
      loadQuizHistory();
    }
  }, [quiz.id]);

  const loadQuizHistory = async () => {
    setLoadingHistory(true);
    try {
      const [attemptsData, statsData] = await Promise.all([
        apiCall(`/quiz/attempts/${quiz.id}`),
        apiCall(`/quiz/${quiz.id}/stats`)
      ]);
      setAttemptHistory(attemptsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const answersArray = quiz.questions.map((_, idx) => selectedAnswers[idx] ?? 0);
      
      const result = await apiCall('/quiz/attempt', 'POST', {
        quiz_id: quiz.id,
        answers: answersArray,
        time_taken: null
      });

      setScore(result.score);
      setShowResults(true);
      
      if (showHistory) {
        await loadQuizHistory();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
      });
      setScore(correctCount);
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setViewMode('quiz');
  };

  const percentage = showResults ? (score / quiz.questions.length) * 100 : 0;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">{quiz.title || 'Practice Quiz'}</h2>
                {quiz.description && (
                  <p className="text-sm text-gray-400 mt-1">{quiz.description}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2">
            <button
              onClick={() => { setViewMode('quiz'); handleRetry(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'quiz' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Take Quiz
            </button>
            {showHistory && (
              <button
                onClick={() => { setViewMode('history'); loadQuizHistory(); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History ({attemptHistory.length})
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {viewMode === 'history' ? (
            // History View
            <div className="space-y-4">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                  <p className="text-gray-400 mt-2">Loading history...</p>
                </div>
              ) : (
                <>
                  {stats && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                        Your Progress
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{stats.total_attempts}</div>
                          <div className="text-xs text-gray-400">Total Attempts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{stats.best_score}%</div>
                          <div className="text-xs text-gray-400">Best Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{stats.average_score}%</div>
                          <div className="text-xs text-gray-400">Average Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
                          </div>
                          <div className="text-xs text-gray-400">Improvement</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">All Attempts</h4>
                    {attemptHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No attempts yet. Take the quiz to get started!</p>
                      </div>
                    ) : (
                      attemptHistory.map((attempt, idx) => (
                        <div
                          key={attempt.id}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-sm text-gray-400">Attempt #{attemptHistory.length - idx}</div>
                                <div className={`text-2xl font-bold ${
                                  attempt.percentage >= 80 ? 'text-green-400' :
                                  attempt.percentage >= 60 ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  {attempt.percentage.toFixed(0)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {attempt.score}/{quiz.total_questions} correct
                                </div>
                                <div className="text-sm text-gray-400">
                                  {new Date(attempt.completed_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div>
                              {attempt.percentage === stats?.best_score && (
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
                                  🏆 Best
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          ) : !showResults ? (
            // Quiz Taking View
            <>
              {quiz.questions.map((question, qIdx) => (
                <div key={qIdx} className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-lg leading-relaxed">{question.question}</p>
                    </div>
                  </div>
                  
                  <div className="ml-11 space-y-2">
                    {question.options.map((option, oIdx) => (
                      <label 
                        key={oIdx} 
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                          selectedAnswers[qIdx] === oIdx 
                            ? 'bg-purple-600/20 border-2 border-purple-500' 
                            : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          value={oIdx}
                          checked={selectedAnswers[qIdx] === oIdx}
                          onChange={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300 flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length || submitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Results View
            <>
              <div className="text-center py-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
                <Trophy className={`w-20 h-20 mx-auto mb-4 ${
                  percentage === 100 ? 'text-yellow-400' : 
                  percentage >= 80 ? 'text-purple-400' : 
                  percentage >= 60 ? 'text-blue-400' : 
                  'text-gray-400'
                }`} />
                <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
                <p className="text-2xl text-gray-300 mb-2">
                  Your Score: <span className="text-purple-400 font-bold">{score}/{quiz.questions.length}</span>
                </p>
                <p className="text-xl font-semibold mb-2">
                  <span className={`${
                    percentage === 100 ? 'text-yellow-400' :
                    percentage >= 80 ? 'text-green-400' :
                    percentage >= 60 ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {percentage.toFixed(0)}%
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {percentage === 100 ? '🎉 Perfect Score! Outstanding!' :
                   percentage >= 80 ? '🌟 Excellent Work!' :
                   percentage >= 60 ? '👍 Good Job!' :
                   '💪 Keep Learning!'}
                </p>
              </div>

              {/* Review */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Answer Review</span>
                </h4>
                
                {quiz.questions.map((question, qIdx) => {
                  const userAnswer = selectedAnswers[qIdx];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={qIdx} 
                      className={`rounded-xl p-6 border-2 ${
                        isCorrect 
                          ? 'bg-green-900/10 border-green-500/30' 
                          : 'bg-red-900/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3 mb-4">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          isCorrect ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{question.question}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-gray-400">
                              Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                {question.options[userAnswer]}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-gray-400">
                                Correct answer: <span className="text-green-400">
                                  {question.options[question.correctAnswer]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {question.explanation && (
                        <div className="ml-11 mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            <span className="font-semibold text-purple-400">💡 Explanation: </span>
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <button 
                  onClick={handleRetry} 
                  className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center space-x-2 transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Quiz</span>
                </button>
                {showHistory && (
                  <button 
                    onClick={() => setViewMode('history')}
                    className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center space-x-2 transform hover:scale-105"
                  >
                    <History className="w-4 h-4" />
                    <span>View History</span>
                  </button>
                )}
                <button 
                  onClick={onClose} 
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PageEditor = ({ pageId, onBack, currentFolder }) => {
  const [title, setTitle] = useState('Untitled Note');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [proactiveMode, setProactiveMode] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const autoSaveTimer = useRef(null);

  const { note, loading, error, saving, saveNote, autoSave } = useNote(pageId);
  const { isEnabled: aiEnabled, loading: aiLoading } = useAI();
  const { connected: wsConnected, aiSuggestions, sendTypingActivity, requestAnalysis } = useWebSocket();

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ 
        multicolor: true,
        HTMLAttributes: {
          class: 'highlighted-text',
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline hover:text-purple-300',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[600px] text-lg leading-relaxed',
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        autoSave({ 
          title, 
          content: html,
          folder_id: currentFolder?.id || null 
        });
        
        if (wsConnected && proactiveMode) {
          sendTypingActivity(editor.getText());
        }
      }, 2000);
    },
  });

  // Auto-save title
  useEffect(() => {
    if (note && title !== note.title) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        const currentContent = editor ? editor.getHTML() : note.content;
        autoSave({
          title,
          content: currentContent,
          folder_id: currentFolder?.id || null
        });
      }, 1500);
    }
  }, [title]);

  useEffect(() => {
    if (note && editor) {
      setTitle(note.title || 'Untitled Note');
      if (note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note, editor]);

  useEffect(() => {
    // Global function to open quiz with history
    window.openQuiz = async (quizId, showHistory = true) => {
      const quiz = window.quizzes?.[quizId];
      if (quiz) {
        setActiveQuiz({ ...quiz, showHistory });
      } else {
        try {
          const quizData = await apiCall(`/quiz/${quizId}`);
          setActiveQuiz({ ...quizData, showHistory });
        } catch (err) {
          console.error('Failed to load quiz:', err);
          showNotification('Failed to load quiz', 'error');
        }
      }
    };
    
    return () => {
      delete window.openQuiz;
    };
  }, []);

  // ✅ Generate Contextual Quiz
  const generateContextualQuiz = async (contextQuery = '') => {
    if (!note?.id) {
      showNotification('Please save your note first', 'error');
      return;
    }

    const selectedText = editor ? editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    ) : '';

    const finalContext = contextQuery || selectedText || 'main concepts';

    setGeneratingContent(true);
    
    try {
      const data = await apiCall('/ai/quiz/generate', 'POST', {
        note_id: note.id,
        difficulty: 'progressive',
        num_questions: 5,
        topic: title,
        quiz_type: 'contextual',
        context_query: finalContext
      });
      
      if (data.success && data.quiz) {
        const quizButton = createQuizButtonHTML(data.quiz, 'contextual');
        editor.commands.insertContent(quizButton);
        
        window.quizzes = window.quizzes || {};
        window.quizzes[data.quiz.id] = data.quiz;
        
        setActiveQuiz({ ...data.quiz, showHistory: true });
        
        showNotification('🎯 Quick quiz generated!', 'success');
        
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: `✨ Generated: "${data.quiz.title}"`,
          timestamp: new Date()
        }]);
      }
      
    } catch (error) {
      console.error('Contextual quiz generation error:', error);
      showNotification(error.message || 'Failed to generate quiz', 'error');
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setGeneratingContent(false);
    }
  };

  // ✅ Generate Comprehensive Quiz
  const generateComprehensiveQuiz = async () => {
    if (!note?.id) {
      showNotification('Please save your note first', 'error');
      return;
    }

    setGeneratingContent(true);
    
    try {
      const data = await apiCall('/ai/quiz/generate', 'POST', {
        note_id: note.id,
        difficulty: 'progressive',
        num_questions: 15,
        topic: title,
        quiz_type: 'comprehensive',
        context_query: null
      });
      
      if (data.success && data.quiz) {
        const quizButton = createQuizButtonHTML(data.quiz, 'comprehensive');
        editor.commands.insertContent(quizButton);
        
        window.quizzes = window.quizzes || {};
        window.quizzes[data.quiz.id] = data.quiz;
        
        setActiveQuiz({ ...data.quiz, showHistory: true });
        
        showNotification('🎓 Comprehensive exam generated!', 'success');
        
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: `✨ Generated exam: "${data.quiz.title}" (${data.quiz.total_questions} questions)`,
          timestamp: new Date()
        }]);
      }
      
    } catch (error) {
      console.error('Comprehensive quiz generation error:', error);
      showNotification(error.message || 'Failed to generate quiz', 'error');
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setGeneratingContent(false);
    }
  };

  // ✅ Transform content (append mode)
  const transformContent = async (action, specificQuery = '') => {
    if (!note?.id) {
      showNotification('Please save your note first', 'error');
      return;
    }

    setGeneratingContent(true);

    try {
      const noteContent = editor?.getHTML() || '';
      
      const data = await apiCall('/ai/notes/ai-transform', 'POST', {
        note_id: note.id,
        action: action,
        content: noteContent,
        specific_query: specificQuery
      });
      
      if (data.success && data.transformed_content) {
        appendToNotes(data.transformed_content, specificQuery || action, action);
        
        showNotification(`✨ Content ${action}ed successfully!`, 'success');
        
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: `✨ ${action.charAt(0).toUpperCase() + action.slice(1)} generated!`,
          timestamp: new Date()
        }]);
      }
      
    } catch (error) {
      console.error(`Transform ${action} error:`, error);
      showNotification(error.message || `Failed to ${action} content`, 'error');
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setGeneratingContent(false);
    }
  };

  // ✅ Structure and REPLACE Content (NEW)
  const structureAndReplaceContent = async () => {
    if (!note?.id) {
      showNotification('Please save your note first', 'error');
      return;
    }

    // Show confirmation modal first
    const userConfirmed = window.confirm(
      '⚠️ This will reorganize and replace your entire note content with a beautifully structured version.\n\nThis action cannot be undone.\n\nContinue?'
    );

    if (!userConfirmed) return;

    setGeneratingContent(true);

    try {
      const noteContent = editor?.getHTML() || '';
      
      const data = await apiCall('/ai/notes/ai-transform', 'POST', {
        note_id: note.id,
        action: 'structure',
        content: noteContent,
        specific_query: null
      });
      
if (data.success && data.transformed_content) {
        // ✅ REPLACE entire content instead of appending
        editor.commands.setContent(data.transformed_content);
        
        // Save the updated content immediately
        try {
          await apiCall(`/notes/${note.id}`, 'PUT', {
            title: title,
            content: data.transformed_content,
            folder_id: currentFolder?.id || null
          });
          
          showNotification('✨ Content restructured and saved beautifully!', 'success');
        } catch (saveError) {
          console.error('Failed to save restructured content:', saveError);
          showNotification('⚠️ Content restructured but failed to save', 'error');
        }
        
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: `✨ Content restructured and replaced!`,
          timestamp: new Date()
        }]);
      }
      
    } catch (error) {
      console.error(`Structure error:`, error);
      showNotification(error.message || `Failed to structure content`, 'error');
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setGeneratingContent(false);
    }
  };

  // Create quiz button HTML
  const createQuizButtonHTML = (quiz, quizType = 'contextual') => {
    const isContextual = quizType === 'contextual';
    const icon = isContextual ? '🎯' : '🎓';
    const bgGradient = isContextual 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    const typeLabel = isContextual ? 'Quick Quiz' : 'Comprehensive Exam';

    return `
      <div style="margin: 2rem 0;">
        <div style="background: ${bgGradient}; padding: 3px; border-radius: 12px;">
          <div style="background: #0a0a0a; border-radius: 10px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="color: #fbbf24; font-size: 1.25rem; flex: 1;">${icon} ${quiz.title}</h3>
              <span style="background: rgba(139, 92, 246, 0.2); padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; color: #a78bfa; font-weight: 600; border: 1px solid rgba(139, 92, 246, 0.3);">${typeLabel}</span>
            </div>
            <p style="color: #e5e7eb; margin-bottom: 1rem; font-size: 0.95rem;">${quiz.description || 'Test your knowledge'}</p>
            <div style="background: rgba(139, 92, 246, 0.1); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid rgba(139, 92, 246, 0.3);">
              <div style="color: #a78bfa; font-size: 0.875rem; margin-bottom: 0.5rem; font-weight: 600;">📊 ${quiz.total_questions} Questions • ${quiz.difficulty}</div>
            </div>
            <button 
              onclick="window.openQuiz(${quiz.id}, true)"
              style="background: ${bgGradient}; color: white; padding: 0.75rem 2rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: bold; font-size: 1rem; width: 100%; transition: transform 0.2s;"
              onmouseover="this.style.transform='scale(1.02)'"
              onmouseout="this.style.transform='scale(1)'">
              ${icon} Start Quiz • Track Your Progress
            </button>
            <div style="margin-top: 0.75rem; text-align: center; color: #9ca3af; font-size: 0.75rem;">
              💡 Retake anytime to improve your score
            </div>
          </div>
        </div>
      </div>
    `;
  };
  
  // Colorful note formatting (for append mode)
  const appendToNotes = (content, title, type) => {
    if (!editor) return;
    
    const timestamp = new Date().toLocaleString();
    
    const gradients = {
      explain: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      summarize: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      example: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      simplify: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      expand: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      structure: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      default: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)'
    };
    
    const gradient = gradients[type] || gradients.default;
    
    // Convert markdown to HTML
    const formattedContent = content
      .replace(/## (.*?)(\n|$)/g, '<h3 style="color: #a78bfa; margin: 1.5rem 0 1rem 0; font-size: 1.25rem; font-weight: bold;">$1</h3>')
      .replace(/### (.*?)(\n|$)/g, '<h4 style="color: #c4b5fd; margin: 1rem 0 0.5rem 0; font-size: 1.1rem; font-weight: bold;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fbbf24;">$1</strong>')
      .replace(/• (.*?)(\n|$)/g, '<div style="margin: 0.5rem 0; padding-left: 1rem; color: #e5e7eb;">• $1</div>')
      .replace(/\n\n/g, '<div style="margin: 1rem 0;"></div>')
      .replace(/\| (.*?) \|/g, '<div style="background: rgba(139, 92, 246, 0.1); padding: 0.5rem; margin: 0.25rem 0; border-left: 3px solid #a78bfa;">$1</div>');
    
    const icons = {
      explain: '💡',
      summarize: '📋',
      example: '🌟',
      simplify: '🎯',
      expand: '📚',
      structure: '📐',
      default: '🤖'
    };

    const formattedBlock = `
      <div style="margin: 2rem 0;">
        <div style="background: ${gradient}; padding: 3px; border-radius: 12px;">
          <div style="background: #0a0a0a; border-radius: 10px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <span style="font-size: 1.5rem;">${icons[type] || icons.default}</span>
              <h2 style="background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; font-size: 1.5rem; font-weight: bold;">
                ${title || 'AI Generated Content'}
              </h2>
            </div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 1rem;">
              ${timestamp}
            </div>
            <div style="color: #e5e7eb; line-height: 1.8;">
              ${formattedContent}
            </div>
          </div>
        </div>
      </div>
    `;
    
    editor.commands.insertContent(formattedBlock);
  };

  const sendChatMessage = async () => {
    const input = chatInput.trim();
    if (!input) return;
    
    setChatInput('');
    
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }]);
    
    // Parse commands
    const commandMatch = input.match(/^(explain|practice|quiz|exam|summarize|example|simplify|expand|structure)\s*(.*)/i);
    
    if (commandMatch) {
      const [, command, query] = commandMatch;
      const cmd = command.toLowerCase();
      
      if (cmd === 'practice' || cmd === 'quiz') {
        await generateContextualQuiz(query);
      } else if (cmd === 'exam') {
        await generateComprehensiveQuiz();
      } else if (cmd === 'structure') {
        await structureAndReplaceContent(); // Use special replace function
      } else {
        await transformContent(cmd, query);
      }
    } else {
      await transformContent('explain', input);
    }
  };

  // ✅ Updated Quick Actions with Structure button marked as special
const quickActions = [
  { icon: Lightbulb, label: "Explain", command: "explain", color: "from-purple-500 to-pink-500" },
  { icon: FileText, label: "Summarize", command: "summarize", color: "from-blue-500 to-cyan-500" },
  { icon: Target, label: "Quick Quiz", command: "contextual", color: "from-green-500 to-teal-500" },
  { icon: GraduationCap, label: "Full Exam", command: "comprehensive", color: "from-pink-500 to-purple-500" },
  { icon: Sparkles, label: "Examples", command: "example", color: "from-yellow-500 to-amber-500" }
];

  if (loading || !editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-lg ${
              notification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-medium ${
                  notification.type === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {notification.message}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        className="bg-black border-b border-gray-900" 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-900 rounded-xl transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400"
                placeholder="Untitled Note"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span>{saving ? 'Saving...' : 'Auto-saved'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-xs">
              {aiEnabled ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Brain className="w-3 h-3" />
                  <span>AI Ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Brain className="w-3 h-3" />
                  <span>AI Offline</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowChat(!showChat)} 
              className={`p-3 rounded-xl transition-colors border border-gray-800 ${
                showChat ? 'bg-purple-600' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div 
          className="flex-1 flex flex-col" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          {/* Quick Actions Bar */}
          {aiEnabled && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
              <div className="flex items-center space-x-3 overflow-x-auto">
                <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 flex-shrink-0">Quick AI Actions:</span>
                {quickActions.map((action) => (
                  <button
                    key={action.command}
                    onClick={() => {
                      if (action.command === 'contextual') {
                        generateContextualQuiz('');
                      } else if (action.command === 'comprehensive') {
                        generateComprehensiveQuiz();
                      } else if (action.command === 'structure' && action.special) {
                        structureAndReplaceContent(); // Use special replace function
                      } else {
                        transformContent(action.command, '');
                      }
                    }}
                    disabled={generatingContent}
                    className={`px-4 py-2 bg-gradient-to-r ${action.color} rounded-lg text-sm text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0`}
                  >
                    <action.icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                ))}
                {generatingContent && (
                  <div className="flex items-center space-x-2 text-purple-400 flex-shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 p-8 bg-black overflow-y-auto">
            <EditorContent editor={editor} className="h-full text-white" />
          </div>
        </motion.div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col" 
              initial={{ x: 400 }} 
              animate={{ x: 0 }} 
              exit={{ x: 400 }}
            >
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-white">AI Assistant</span>
                  </div>
                  <button 
                    onClick={() => setShowChat(false)} 
                    className="p-1 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Commands: explain, summarize, structure, quiz, exam, example, simplify, expand
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Ask me anything or use a command</p>
                    <div className="text-xs mt-3 space-y-1">
                      <p>💡 "explain machine learning"</p>
                      <p>📋 "summarize" - Key takeaways</p>
                      <p>📐 "structure" - Reorganize & beautify</p>
                      <p>🎯 "quiz" - Quick contextual quiz</p>
                      <p>🎓 "exam" - Comprehensive test</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                      msg.type === 'user' ? 'bg-purple-600 text-white' : 
                      msg.type === 'system' ? msg.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !generatingContent && sendChatMessage()}
                    placeholder="Type a command..."
                    className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={generatingContent}
                  />
                  <button 
                    onClick={sendChatMessage} 
                    disabled={!chatInput.trim() || generatingContent} 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {generatingContent ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <QuizModal 
            quiz={activeQuiz} 
            onClose={() => setActiveQuiz(null)}
            onRetry={() => {
              if (activeQuiz.topic) {
                generateContextualQuiz(activeQuiz.topic);
              } else {
                generateComprehensiveQuiz();
              }
            }}
            showHistory={activeQuiz.showHistory || false}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageEditor;