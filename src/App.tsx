import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, RefreshCw, ChevronRight, HelpCircle, Share2, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getDailyQuestion, MathQuestion } from './services/mathService';
import { cn } from './lib/utils';

type GameStatus = 'playing' | 'won' | 'lost';

export default function App() {
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [showStudy, setShowStudy] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const q = await getDailyQuestion(today);
        setQuestion(q);
        
        // Check local storage for today's progress
        const saved = localStorage.getItem(`math-termo-${today}`);
        if (saved) {
          const { status: savedStatus, selectedOption: savedOption, attempts: savedAttempts } = JSON.parse(saved);
          setStatus(savedStatus);
          setSelectedOption(savedOption);
          setAttempts(savedAttempts);
        }
      } catch (err) {
        setError('Não foi possível carregar o desafio de hoje. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [today]);

  const handleSelect = (index: number) => {
    if (status !== 'playing') return;
    
    setSelectedOption(index);
    const isCorrect = index === question?.correctAnswerIndex;
    
    const newStatus = isCorrect ? 'won' : 'lost';
    setStatus(newStatus);
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    localStorage.setItem(`math-termo-${today}`, JSON.stringify({
      status: newStatus,
      selectedOption: index,
      attempts: attempts + 1
    }));
  };

  const shareResult = () => {
    const text = `Resolvi o MathTermo de hoje (${today})! 🧩✨\n${status === 'won' ? '✅ Acertei!' : '❌ Errei...'}\nJogue em: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Resultado copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <p className="mt-4 text-zinc-400 font-medium">Preparando o desafio matemático...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h1>
        <p className="text-zinc-400 max-w-md">{error || 'Questão não encontrada.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">Σ</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tighter uppercase">MathTermo</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{today}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStudy(!showStudy)}
            className={cn(
              "p-2 rounded-lg transition-all",
              showStudy ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            title="Estudar conteúdo"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!showStudy ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Question Card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded uppercase tracking-wider">
                    {question.topic}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                    question.difficulty === 'Fácil' ? "bg-emerald-500/10 text-emerald-500" :
                    question.difficulty === 'Médio' ? "bg-amber-500/10 text-amber-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {question.difficulty}
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {question.question}
                  </Markdown>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === question.correctAnswerIndex;
                  const showResult = status !== 'playing';

                  return (
                    <button
                      key={idx}
                      disabled={status !== 'playing'}
                      onClick={() => handleSelect(idx)}
                      className={cn(
                        "group relative flex items-center p-5 rounded-xl border-2 transition-all text-left",
                        status === 'playing' 
                          ? "bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50" 
                          : isCorrect 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                            : isSelected 
                              ? "bg-red-500/10 border-red-500 text-red-500"
                              : "bg-zinc-900 border-zinc-800 opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-bold text-sm transition-colors",
                        status === 'playing'
                          ? "bg-zinc-800 text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white"
                          : isCorrect
                            ? "bg-emerald-500 text-white"
                            : isSelected
                              ? "bg-red-500 text-white"
                              : "bg-zinc-800 text-zinc-500"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-medium flex-1">{option}</span>
                      
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 ml-2" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Section */}
              {status !== 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-4"
                >
                  <div className="flex justify-center mb-2">
                    {status === 'won' ? (
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold">
                    {status === 'won' ? 'Excelente!' : 'Não foi desta vez.'}
                  </h2>
                  <div className="text-zinc-400 text-sm italic prose prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {question.explanation}
                    </Markdown>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowStudy(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Estudar Tópico
                    </button>
                    <button 
                      onClick={shareResult}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="study"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setShowStudy(false)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                >
                  <div className="p-1 bg-zinc-800 rounded group-hover:bg-zinc-700">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">Voltar ao Desafio</span>
                </button>
                <span className="text-xs font-mono text-zinc-500 uppercase">Material de Apoio</span>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <h2 className="text-2xl font-display font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-4">
                  {question.topic}
                </h2>
                <div className="markdown-body">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {question.studyContent}
                  </Markdown>
                </div>
              </div>

              <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 mb-1">Dica de Estudo</h4>
                  <p className="text-sm text-zinc-400">
                    A prática constante é o segredo da matemática. Tente resolver a questão novamente amanhã para fixar o conhecimento!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
        <p>© 2024 MathTermo • Um desafio por dia</p>
      </footer>
    </div>
  );
}
