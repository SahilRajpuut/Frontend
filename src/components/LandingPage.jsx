import React, { useRef } from 'react';
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight, Play, Check, Mail, Phone } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Updated NoteFlow Doodle Logo Component with your diagonal rocket
  const NoteFlowLogo = ({ size = 40 }) => (
    <div className={`w-10 h-10 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg border border-gray-200`}>
      <svg width={size-8} height={size-8} viewBox="0 0 80 120" className="hand-drawn">
        {/* Rocket body */}
        <path
          d="M40 10 L55 35 L55 75 L40 95 L25 75 L25 35 Z"
          fill="white"
          stroke="#333"
          strokeWidth="2.5"
        />
        
        {/* Rocket nose cone */}
        <path
          d="M40 5 L50 25 L40 10 L30 25 Z"
          fill="white"
          stroke="#333"
          strokeWidth="2"
        />
        
        {/* Rocket window */}
        <circle 
          cx="40" 
          cy="50" 
          r="8" 
          fill="#87CEEB" 
          stroke="#333" 
          strokeWidth="2" 
        />
        
        {/* Rocket fins */}
        <path 
          d="M25 75 L15 95 L25 85 Z" 
          fill="white" 
          stroke="#333" 
          strokeWidth="2" 
        />
        <path 
          d="M55 75 L65 95 L55 85 Z" 
          fill="white" 
          stroke="#333" 
          strokeWidth="2" 
        />
        
        {/* Rocket details/lines */}
        <line 
          x1="30" 
          y1="35" 
          x2="50" 
          y2="35" 
          stroke="#333" 
          strokeWidth="1.5" 
        />
        <line 
          x1="30" 
          y1="30" 
          x2="50" 
          y2="30" 
          stroke="#333" 
          strokeWidth="1.5" 
        />
        
        {/* Rocket flames */}
        <path 
          d="M35 95 L30 110 L40 105 L50 110 L45 95 Z" 
          fill="#FF4500" 
          stroke="#333" 
          strokeWidth="1.5" 
        />
        
        {/* Additional flame details */}
        <path 
          d="M32 95 L28 105 L35 100 Z" 
          fill="#FF6B00" 
          stroke="#333" 
          strokeWidth="1" 
        />
        <path 
          d="M48 95 L52 105 L45 100 Z" 
          fill="#FF6B00" 
          stroke="#333" 
          strokeWidth="1" 
        />
      </svg>
    </div>
  );

  // Updated screenshot data with educational themes
  const screenshots = [
    { 
      id: 1, 
      title: 'AI Note Analysis',
      description: 'AI analyzes and enhances your notes in real-time',
      component: (
        <div className="h-48 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center relative border border-purple-200 rounded-lg">
          <div className="absolute inset-4 bg-white rounded border-2 border-dashed border-gray-300 p-4">
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 2C5.8 2 4 3.8 4 6c0 1.1.4 2.1 1.1 2.8L8 12l2.9-3.2C11.6 8.1 12 7.1 12 6c0-2.2-1.8-4-4-4z"/>
              <circle cx="8" cy="6" r="1.5" fill="white"/>
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-purple-600 font-semibold">AI Analyzing...</div>
        </div>
      )
    },
    { 
      id: 2, 
      title: 'Smart Study Plans',
      description: 'Personalized learning schedules that adapt to your pace',
      component: (
        <div className="h-48 bg-gradient-to-br from-green-500/10 to-teal-500/10 flex items-center justify-center relative border border-green-200 rounded-lg">
          <div className="grid grid-cols-7 gap-1 p-4 bg-white rounded-lg shadow-sm border">
            {[...Array(21)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded text-xs flex items-center justify-center ${
                  i < 7 ? 'bg-green-100 text-green-600' : 
                  i < 14 ? 'bg-blue-100 text-blue-600' : 
                  'bg-yellow-100 text-yellow-600'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="absolute top-4 right-4 text-green-600 text-xs font-bold">📅 Smart Plan</div>
          <div className="absolute bottom-4 left-4 flex space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      )
    },
    { 
      id: 3, 
      title: 'Interactive Learning',
      description: 'Engage with AI tutor through voice and chat',
      component: (
        <div className="h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center relative border border-blue-200 rounded-lg">
          <div className="w-32 h-24 bg-gray-800 rounded-lg relative">
            <div className="absolute inset-2 bg-blue-50 rounded flex flex-col items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full mb-2 flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👋</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 text-blue-600 text-xs font-semibold">Live Session</div>
        </div>
      )
    },
    { 
      id: 4, 
      title: 'Progress Tracking',
      description: 'Visual progress with achievements and milestones',
      component: (
        <div className="h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center relative border border-orange-200 rounded-lg">
          <div className="space-y-4">
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-24 h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">🏆</div>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">⭐</div>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">🎯</div>
            </div>
          </div>
          <div className="absolute top-4 right-4 text-orange-600 text-xs font-bold">75% Complete</div>
          <div className="absolute bottom-4 left-4 text-orange-600 text-xs font-semibold">Achievement Unlocked!</div>
        </div>
      )
    },
    { 
      id: 5, 
      title: 'Collaborative Notes',
      description: 'Share and collaborate on notes with classmates',
      component: (
        <div className="h-48 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 flex items-center justify-center relative border border-cyan-200 rounded-lg">
          <div className="flex space-x-4">
            <div className="w-16 h-20 bg-white rounded border-2 border-cyan-300 p-2">
              <div className="space-y-1">
                <div className="h-1 bg-cyan-300 rounded w-full"></div>
                <div className="h-1 bg-cyan-300 rounded w-3/4"></div>
                <div className="h-1 bg-cyan-300 rounded w-full"></div>
              </div>
            </div>
            <div className="w-16 h-20 bg-white rounded border-2 border-teal-300 p-2">
              <div className="space-y-1">
                <div className="h-1 bg-teal-300 rounded w-full"></div>
                <div className="h-1 bg-teal-300 rounded w-2/3"></div>
                <div className="h-1 bg-teal-300 rounded w-full"></div>
              </div>
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 50">
            <path d="M30 25 Q50 15 70 25" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          </svg>
          <div className="absolute top-4 right-4 text-cyan-600 text-xs font-bold">2 Users</div>
          <div className="absolute bottom-4 left-4 text-cyan-600 text-xs font-semibold">Synced</div>
        </div>
      )
    },
  ];

  // Hand-drawn style SVG illustrations
  const HandDrawnIllustrations = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Physics Formula E=mc² */}
      <div
        className="absolute top-20 left-10 text-purple-400 opacity-70"
      >
        <svg width="100" height="50" viewBox="0 0 100 50" className="hand-drawn">
          <text x="5" y="30" fontSize="22" fontFamily="Comic Sans MS, cursive" fill="currentColor" transform="rotate(-5)">
            E=mc²
          </text>
        </svg>
      </div>

      {/* Chemistry - Molecular Structure (H2O) */}
      <div
        className="absolute top-32 right-20 text-blue-400 opacity-60"
      >
        <svg width="80" height="60" viewBox="0 0 80 60" className="hand-drawn">
          {/* H2O molecule structure */}
          <circle cx="40" cy="30" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="20" cy="40" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="32" y1="25" x2="25" y2="22" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="35" x2="25" y2="38" stroke="currentColor" strokeWidth="2" />
          <text x="37" y="35" fontSize="10" fill="currentColor">O</text>
          <text x="17" y="25" fontSize="8" fill="currentColor">H</text>
          <text x="17" y="45" fontSize="8" fill="currentColor">H</text>
        </svg>
      </div>

      {/* Math - Pythagorean Theorem */}
      <div
        className="absolute top-16 right-1/3 text-green-400 opacity-60"
      >
        <svg width="80" height="70" viewBox="0 0 80 70" className="hand-drawn">
          {/* Right triangle */}
          <path d="M20 50 L50 50 L50 20 Z" stroke="currentColor" strokeWidth="2" fill="none" />
          {/* Right angle indicator */}
          <path d="M45 50 L45 45 L50 45" stroke="currentColor" strokeWidth="1" fill="none" />
          <text x="10" y="40" fontSize="12" fill="currentColor">a</text>
          <text x="55" y="38" fontSize="12" fill="currentColor">b</text>
          <text x="30" y="15" fontSize="12" fill="currentColor">c</text>
          <text x="15" y="65" fontSize="10" fill="currentColor">a²+b²=c²</text>
        </svg>
      </div>

      {/* Physics - Force Formula (F=ma) */}
      <div
        className="absolute top-40 right-10 text-yellow-400 opacity-50"
      >
        <svg width="70" height="40" viewBox="0 0 70 40" className="hand-drawn">
          <text x="5" y="25" fontSize="18" fontFamily="Comic Sans MS, cursive" fill="currentColor" transform="rotate(5)">
            F=ma
          </text>
        </svg>
      </div>

      {/* Chemistry - Benzene Ring */}
      <div
        className="absolute top-52 left-1/4 text-cyan-400 opacity-50"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="hand-drawn">
          {/* Benzene hexagon */}
          <path d="M30 10 L45 20 L45 40 L30 50 L15 40 L15 20 Z" stroke="currentColor" strokeWidth="2" fill="none" />
          {/* Inner circle for aromatic system */}
          <circle cx="30" cy="30" r="10" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3,2" />
          <text x="25" y="35" fontSize="8" fill="currentColor">C₆H₆</text>
        </svg>
      </div>

      {/* Math - Calculus Integral */}
      <div
        className="absolute top-24 left-1/3 text-red-400 opacity-50"
      >
        <svg width="70" height="50" viewBox="0 0 70 50" className="hand-drawn">
          <text x="5" y="35" fontSize="20" fontFamily="serif" fill="currentColor">∫</text>
          <text x="25" y="30" fontSize="14" fill="currentColor">f(x)dx</text>
        </svg>
      </div>

      {/* Physics - Wavelength */}
      <div
        className="absolute top-8 left-1/2 text-indigo-400 opacity-40"
      >
        <svg width="90" height="40" viewBox="0 0 90 40" className="hand-drawn">
          {/* Sine wave */}
          <path d="M5 20 Q15 5 25 20 T45 20 T65 20 T85 20" stroke="currentColor" strokeWidth="2" fill="none" />
          <text x="35" y="35" fontSize="10" fill="currentColor">λ = c/f</text>
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black" />
        <div
          className="absolute top-1/4 left-1/6 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"
        />
        <div
          className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <NoteFlowLogo size={40} />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NoteFlow
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">Pricing</a>
            <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">Contact</a>
          </div>

          <button 
            onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg text-white border border-purple-500/30"
          >
            Try for Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 text-center">
        {/* Hand-drawn Illustrations */}
        <div className="relative max-w-6xl mx-auto mb-32">
          <HandDrawnIllustrations />
          {/* Large spacer for illustrations - equivalent to 7-10 lines */}
          <div className="h-48 md:h-56"></div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block mb-4">
            India's First AI Tutor
          </span>
          <span className="text-white/90">
            That Lives in Your Notes
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Transform your learning experience with AI that understands your notes, 
          suggests improvements, and helps you master any subject faster than ever before.
        </p>

        <div className="flex justify-center items-center mb-16">
          <button 
            onClick={onGetStarted}
            className="group relative px-10 py-4 bg-black border-2 border-purple-600 rounded-xl text-lg font-semibold hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-2xl text-white"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Screenshot Carousel - Moved up */}
      <section className="relative z-10 py-16 bg-gray-900/20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">See NoteFlow in Action</h2>
          
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/80 rounded-full hover:bg-black transition-colors border border-gray-800"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="flex-shrink-0 w-80 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
                >
                  {screenshot.component}
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{screenshot.title}</h3>
                    <p className="text-gray-400 text-sm mt-2">{screenshot.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={scrollRight}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/80 rounded-full hover:bg-black transition-colors border border-gray-800"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="relative z-10 py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-16">
            Everything you need, right where you work
          </h2>

          {/* Video Demo Placeholder */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-gray-900 rounded-2xl border-2 border-dashed border-gray-700 h-96 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-20 h-20 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Video Generation Demo</h3>
                <p className="text-gray-400">Interactive demo will be embedded here</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12">Choose Your Learning Journey</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Pilot Plan */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                <h4 className="text-2xl font-bold text-white mb-4">Pilot</h4>
                <div className="text-4xl font-bold text-purple-400 mb-6">₹149</div>
                <p className="text-gray-400 mb-6">7-day unlimited trial</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Full feature access
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Unlimited AI assistance
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    All study tools
                  </li>
                </ul>
                <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-white transition-colors">
                  Start Trial
                </button>
              </div>

              {/* Core Plan */}
              <div className="bg-gray-900 rounded-2xl p-8 border-2 border-purple-500 relative hover:border-purple-400 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Core</h4>
                <div className="text-4xl font-bold text-blue-400 mb-2">₹499</div>
                <p className="text-gray-400 mb-4">Basic (20 videos/month)</p>
                <div className="text-2xl font-bold text-blue-400 mb-6">₹999</div>
                <p className="text-gray-400 mb-6">Unlimited videos</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Advanced AI features
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Video generation
                  </li>
                </ul>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-colors">
                  Get Core
                </button>
              </div>

              {/* Family Plan */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                <h4 className="text-2xl font-bold text-white mb-4">Family</h4>
                <div className="text-4xl font-bold text-green-400 mb-6">₹1,499</div>
                <p className="text-gray-400 mb-6">Per month (3 users)</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    3 user accounts
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Shared libraries
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    Family dashboard
                  </li>
                </ul>
                <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-white transition-colors">
                  Get Family
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-center mb-8">
              <span className="text-purple-400 font-medium">Student Scholarships Available!</span><br />
              Special discounts through school partnerships. Contact us for details.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Moved above Contact */}
      <section className="relative z-10 py-16 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to revolutionize your learning?</h3>
              <p className="text-gray-300 mb-6">
                Join thousands of students already using NoteFlow to accelerate their academic journey.
              </p>
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Simplified */}
      <section 
        id="contact"
        className="relative z-10 py-16 bg-black border-t border-gray-800"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <NoteFlowLogo size={64} />
                <h3 className="text-xl font-bold text-white mt-4 mb-2">NoteFlow</h3>
                <p className="text-gray-400">Your AI Learning Companion</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                  <Mail className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <a href="mailto:srsahilrajput26@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  srsahilrajput26@gmail.com
                </a>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                  <Phone className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <a href="tel:+917247246738" className="text-blue-400 hover:text-blue-300 transition-colors">
                  +91 7247246738
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 bg-black border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <NoteFlowLogo size={32} />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NoteFlow
              </span>
            </div>
            <p className="text-gray-400 text-center">
              © 2025 NoteFlow. 
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;