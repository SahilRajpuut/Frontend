// src/components/PageEditor.jsx (Updated with Feynman Technique Two-Step AI Processing)
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
  Loader2, BookOpen, Trophy, RefreshCw, FileText, Sparkles, Zap
} from 'lucide-react';

// Import hooks
import { useNote } from '../hooks/useNote';
import { useAI } from '../hooks/useAI';
import { useWebSocket } from '../hooks/useWebSocket';

// Quiz Component
const QuizModal = ({ quiz, onClose, onRetry }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">{quiz.title || 'Practice Quiz'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!showResults ? (
            <>
              {quiz.questions.map((question, qIdx) => (
                <div key={qIdx} className="bg-gray-800/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-lg">{question.question}</p>
                      {question.question.includes('Level') && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                          question.question.includes('Level 1') ? 'bg-green-900/30 text-green-400' :
                          question.question.includes('Level 2') ? 'bg-blue-900/30 text-blue-400' :
                          question.question.includes('Level 3') ? 'bg-yellow-900/30 text-yellow-400' :
                          question.question.includes('Level 4') ? 'bg-orange-900/30 text-orange-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {question.question.match(/Level \d/)?.[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-11 space-y-2">
                    {question.options.map((option, oIdx) => (
                      <label key={oIdx} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          value={oIdx}
                          checked={selectedAnswers[qIdx] === oIdx}
                          onChange={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Quiz
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${score === quiz.questions.length ? 'text-yellow-400' : 'text-purple-400'}`} />
                <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                <p className="text-lg text-gray-300">
                  Your Score: <span className="text-purple-400 font-bold">{score}/{quiz.questions.length}</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {score === quiz.questions.length ? '🎉 Perfect Score!' :
                   score >= quiz.questions.length * 0.8 ? '🌟 Excellent Work!' :
                   score >= quiz.questions.length * 0.6 ? '👍 Good Job!' :
                   '💪 Keep Practicing!'}
                </p>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((question, qIdx) => {
                  const isCorrect = selectedAnswers[qIdx] === question.correctAnswer;
                  return (
                    <div key={qIdx} className={`bg-gray-800/50 rounded-xl p-6 border-2 ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                      <div className="flex items-start space-x-3 mb-4">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                          {qIdx + 1}
                        </span>
                        <p className="text-white">{question.question}</p>
                      </div>
                      
                      {question.explanation && (
                        <div className="ml-11 mt-3 p-3 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-purple-400">Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <button onClick={handleRetry} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Quiz</span>
                </button>
                <button onClick={onClose} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition-all">
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
  
  const autoSaveTimer = useRef(null);

  const { note, loading, error, saving, saveNote, autoSave } = useNote(pageId);
  const { isEnabled: aiEnabled, loading: aiLoading, askQuestion, getSuggestions } = useAI();
  const { connected: wsConnected, aiSuggestions, sendTypingActivity, requestAnalysis } = useWebSocket();

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
        placeholder: 'Start writing your notes here...'
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

  // Auto-save title when it changes
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
    // Global function to open quiz
    window.openQuiz = (quizId) => {
      const quiz = window.quizzes?.[quizId];
      if (quiz) {
        setActiveQuiz(quiz);
      } else {
        fetch(`http://localhost:8000/quiz/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('noteflow_token')}`
          }
        })
        .then(res => res.json())
        .then(quiz => {
          setActiveQuiz(quiz);
        })
        .catch(err => console.error('Failed to load quiz:', err));
      }
    };
    
    return () => {
      delete window.openQuiz;
    };
  }, []);

  // Two-step AI processing with Feynman technique
  const processAICommand = async (command, input) => {
    setGeneratingContent(true);
    
    try {
      const noteContent = editor?.getText() || '';
      const topic = input || noteContent.substring(0, 200);
      
      // STEP 1: Get initial explanation/content
      let step1Prompt = '';
      
      switch(command) {
        case 'explain':
          step1Prompt = `Provide a comprehensive technical explanation of: "${topic}"`;
          break;
          
        case 'practice':
          step1Prompt = `Analyze this topic and identify key concepts for quiz questions: "${topic}"`;
          break;
          
        case 'summarize':
          step1Prompt = `Extract key information from: "${noteContent.substring(0, 500)}"`;
          break;
          
        case 'example':
          step1Prompt = `Identify practical applications of: "${topic}"`;
          break;
      }
      
      const step1Response = await askQuestion(step1Prompt, {
        noteIds: note?.id ? [note.id] : null,
        includeRecent: false
      });
      
      if (!step1Response.success || step1Response.error || !step1Response.answer) {
        throw new Error('Initial processing failed');
      }
      
      // Check for backend error messages
      if (step1Response.answer.includes('encountered an error') ||
          step1Response.answer.includes('currently unavailable') ||
          step1Response.answer.includes('AI service error')) {
        throw new Error('AI service unavailable');
      }
      
      // STEP 2: Apply Feynman technique formatting
      let step2Prompt = '';
      
      switch(command) {
        case 'explain':
          step2Prompt = `Transform the following explanation using the Feynman Technique. Create a well-structured, progressive learning experience:

ORIGINAL EXPLANATION:
${step1Response.answer}

FORMAT YOUR RESPONSE AS STRUCTURED MARKDOWN WITH:

## 🎯 The Simple Truth
• One-sentence core concept (imagine explaining to a 12-year-old)
• Why this matters in real life

## 🧩 Breaking It Down
• Divide into 3-4 digestible chunks
• Use bullet points for each key idea
• Include simple analogies (e.g., "Think of it like...")
• Add visual metaphors where helpful

## 💡 Real-World Examples
• Provide 2-3 concrete, relatable examples
• Show how this applies in daily life or common scenarios
• Use "For instance..." or "Imagine..." to make it tangible

## 🔬 Going Deeper
• Technical details for advanced understanding
• Common misconceptions and clarifications
• Connection to related concepts

## ✨ Key Takeaways
• 3-5 bullet points summarizing what to remember
• Actionable insights or applications

Use emojis strategically for visual organization. Keep language clear and engaging.`;
          break;
          
        case 'practice':
          step2Prompt = `Create a progressive quiz based on this analysis. Generate questions that build from basic to advanced:

TOPIC ANALYSIS:
${step1Response.answer}

Return ONLY valid JSON in this format:
{
  "title": "Progressive Quiz: [topic name]",
  "description": "Questions progress from foundational to advanced",
  "questions": [
    {
      "question": "Level 1 (Foundation): [Simple recall question]",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Clear explanation with context"
    },
    {
      "question": "Level 2 (Understanding): [Concept application question]",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 1,
      "explanation": "..."
    },
    {
      "question": "Level 3 (Application): [Scenario-based question]",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 2,
      "explanation": "..."
    },
    {
      "question": "Level 4 (Analysis): [Compare/contrast question]",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 1,
      "explanation": "..."
    },
    {
      "question": "Level 5 (Synthesis): [Complex problem-solving question]",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 3,
      "explanation": "..."
    }
  ]
}

Make each question progressively harder. Start with definitions, then concepts, then applications, then analysis, then synthesis.`;
          break;
          
        case 'summarize':
          step2Prompt = `Create a structured summary using this extracted information:

EXTRACTED CONTENT:
${step1Response.answer}

FORMAT AS MARKDOWN:

## 📋 Executive Summary
• One paragraph capturing the essence

## 🎯 Main Points
• 3-5 key points as bullets
• Each point should be actionable or memorable

## 🔑 Critical Takeaways
• What you absolutely need to remember
• Why this information matters

## 💭 Final Thoughts
• Implications or next steps`;
          break;
          
        case 'example':
          step2Prompt = `Create detailed, relatable examples from this analysis:

CONCEPT ANALYSIS:
${step1Response.answer}

FORMAT AS MARKDOWN:

## 🌟 Real-World Examples

### Example 1: [Everyday Scenario]
• **Situation:** [Describe relatable context]
• **Application:** [How concept applies]
• **Outcome:** [What happens/why it matters]

### Example 2: [Professional Context]
• **Situation:** [Work or study scenario]
• **Application:** [Practical usage]
• **Outcome:** [Results and benefits]

### Example 3: [Advanced Case]
• **Situation:** [Complex real-world example]
• **Application:** [Sophisticated implementation]
• **Outcome:** [Impact and insights]

## 💡 Why These Examples Matter
• Brief reflection on patterns across examples`;
          break;
      }
      
      const step2Response = await askQuestion(step2Prompt, {
        noteIds: null,
        includeRecent: false
      });
      
      if (!step2Response.success || step2Response.error || !step2Response.answer) {
        throw new Error('Formatting failed');
      }
      
      // Process final response
      if (command === 'practice') {
        try {
          const quizData = JSON.parse(step2Response.answer);
          setActiveQuiz(quizData);
          
          const saveResponse = await fetch('http://localhost:8000/quiz/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('noteflow_token')}`
            },
            body: JSON.stringify({
              note_id: note?.id,
              title: quizData.title,
              description: quizData.description || '',
              questions: quizData.questions,
              topic: input || 'General',
              difficulty: 'progressive'
            })
          });
          
          if (saveResponse.ok) {
            const savedQuiz = await saveResponse.json();
            
            const quizButton = `
              <div style="margin: 2rem 0;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 3px; border-radius: 12px;">
                  <div style="background: #0a0a0a; border-radius: 10px; padding: 1.5rem;">
                    <h3 style="color: #fbbf24; margin-bottom: 1rem;">📝 ${quizData.title}</h3>
                    <p style="color: #e5e7eb; margin-bottom: 1rem;">${quizData.description || 'Progressive quiz from basic to advanced'}</p>
                    <div style="background: rgba(139, 92, 246, 0.1); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem;">
                      <div style="color: #a78bfa; font-size: 0.875rem; margin-bottom: 0.5rem;">📊 Difficulty Progression:</div>
                      <div style="display: flex; gap: 0.5rem;">
                        <span style="background: #10b981; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: white;">Easy</span>
                        <span style="background: #f59e0b; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: white;">Medium</span>
                        <span style="background: #ef4444; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: white;">Hard</span>
                      </div>
                    </div>
                    <button 
                      onclick="window.openQuiz(${savedQuiz.id})"
                      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 2rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: bold; font-size: 1rem; width: 100%;">
                      Start Progressive Quiz →
                    </button>
                  </div>
                </div>
              </div>
            `;
            
            editor.commands.insertContent(quizButton);
            
            window.quizzes = window.quizzes || {};
            window.quizzes[savedQuiz.id] = savedQuiz;
            
            setChatMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'system',
              content: '🎯 Progressive quiz created! Questions build from basic to advanced.',
              timestamp: new Date()
            }]);
          }
        } catch (e) {
          console.error('Quiz parsing error:', e);
          appendToNotes(step2Response.answer, 'Practice Questions', 'practice');
        }
      } else {
        appendToNotes(step2Response.answer, input || command, command);
      }
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `✨ ${command.charAt(0).toUpperCase() + command.slice(1)} generated using Feynman technique!`,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('AI command failed:', error);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'The AI Assistant is temporarily unavailable. Please try again later.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setGeneratingContent(false);
    }
  };
  
  // Colorful note formatting
  const appendToNotes = (content, title, type) => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    const timestamp = new Date().toLocaleString();
    
    const gradients = {
      explain: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      practice: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      summarize: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      example: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      default: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)'
    };
    
    const gradient = gradients[type] || gradients.default;
    
    // Convert markdown to HTML-like formatting
    const formattedContent = content
      .replace(/## (.*?)(\n|$)/g, '<h3 style="color: #a78bfa; margin: 1.5rem 0 1rem 0; font-size: 1.25rem; font-weight: bold;">$1</h3>')
      .replace(/### (.*?)(\n|$)/g, '<h4 style="color: #c4b5fd; margin: 1rem 0 0.5rem 0; font-size: 1.1rem; font-weight: bold;">$4</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fbbf24;">$1</strong>')
      .replace(/• (.*?)(\n|$)/g, '<div style="margin: 0.5rem 0; padding-left: 1rem;">• $1</div>')
      .replace(/\n\n/g, '<div style="margin: 1rem 0;"></div>');
    
    const formattedBlock = `
      <div style="margin: 2rem 0;">
        <div style="background: ${gradient}; padding: 3px; border-radius: 12px;">
          <div style="background: #0a0a0a; border-radius: 10px; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <span style="font-size: 1.5rem;">${
                type === 'explain' ? '💡' : 
                type === 'practice' ? '📝' : 
                type === 'summarize' ? '📋' : 
                type === 'example' ? '🌟' : '🤖'
              }</span>
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
    
    editor.commands.setContent(currentContent + formattedBlock);
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
    
    const commandMatch = input.match(/^(explain|practice|summarize|example)\s*(.*)/i);
    
    if (commandMatch) {
      const [, command, query] = commandMatch;
      await processAICommand(command.toLowerCase(), query);
    } else {
      await processAICommand('explain', input);
    }
  };

  const quickActions = [
    { icon: Lightbulb, label: "Explain", command: "explain", color: "from-purple-500 to-pink-500" },
    { icon: BookOpen, label: "Practice", command: "practice", color: "from-pink-500 to-red-500" },
    { icon: FileText, label: "Summarize", command: "summarize", color: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, label: "Examples", command: "example", color: "from-green-500 to-teal-500" }
  ];

  if (loading || !editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <motion.header className="bg-black border-b border-gray-900" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-900 rounded-xl transition-colors text-white">
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

            <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-xl transition-colors border border-gray-800 ${showChat ? 'bg-purple-600' : 'bg-gray-900 hover:bg-gray-800'}`}>
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {aiEnabled && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Quick AI Actions:</span>
                {quickActions.map((action) => (
                  <button
                    key={action.command}
                    onClick={() => processAICommand(action.command, '')}
                    disabled={generatingContent}
                    className={`px-4 py-2 bg-gradient-to-r ${action.color} rounded-lg text-sm text-white font-medium transition-all hover:scale-105 disabled:opacity-50 flex items-center space-x-2`}
                  >
                    <action.icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                ))}
                {generatingContent && (
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 p-8 bg-black overflow-y-auto">
            <EditorContent editor={editor} className="h-full text-white" />
          </div>
        </motion.div>

        <AnimatePresence>
          {showChat && (
            <motion.div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}>
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-white">AI Assistant</span>
                  </div>
                  <button onClick={() => setShowChat(false)} className="p-1 hover:bg-gray-800 rounded-lg">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Commands: explain, practice, summarize, example
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-3 py-2 rounded-lg ${
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
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a command..."
                    className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={sendChatMessage} disabled={!chatInput.trim() || generatingContent} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeQuiz && (
          <QuizModal 
            quiz={activeQuiz} 
            onClose={() => setActiveQuiz(null)}
            onRetry={() => processAICommand('practice', activeQuiz.title)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageEditor;