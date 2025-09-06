import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Question } from '../../types/game';

interface QuizQuestionProps {
  question: Question;
  onAnswerClick: (answer: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string | null;
  correctAnswer?: string;
  showNextButton: boolean;
  onNextQuestion: () => void;
}

export function QuizQuestion({
  question,
  onAnswerClick,
  isAnswered,
  selectedAnswer,
  correctAnswer,
  showNextButton,
  onNextQuestion
}: QuizQuestionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = [
    { key: 'a', text: question.alternativa_a },
    { key: 'b', text: question.alternativa_b },
    { key: 'c', text: question.alternativa_c },
    { key: 'd', text: question.alternativa_d }
  ];

  const getOptionStyle = (optionKey: string) => {
    if (!selectedAnswer) {
      if (hoveredOption === optionKey && !isAnswered) {
        return 'bg-slate-600 border-indigo-500 transform scale-105';
      }
      return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
    }

    // Show feedback after selection
    if (optionKey === correctAnswer) {
      return 'bg-green-500/30 border-green-500 text-green-300 shadow-green-500/20 shadow-lg';
    }
    if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return 'bg-red-500/30 border-red-500 text-red-300 shadow-red-500/20 shadow-lg';
    }
    return 'bg-slate-700/30 border-slate-600/50 opacity-50';
  };

  const getOptionIcon = (optionKey: string) => {
    if (!selectedAnswer) return null;
    
    if (optionKey === correctAnswer) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CheckCircle className="w-6 h-6 text-green-400" />
        </motion.div>
      );
    }
    if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <XCircle className="w-6 h-6 text-red-400" />
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="p-8">
        {/* Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed">
            {question.enunciado}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.nivel === 'facil' ? 'bg-green-500/20 text-green-400' :
              question.nivel === 'medio' ? 'bg-blue-500/20 text-blue-400' :
              question.nivel === 'dificil' ? 'bg-orange-500/20 text-orange-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {question.nivel.charAt(0).toUpperCase() + question.nivel.slice(1)}
            </span>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {options.map((option, index) => (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => !isAnswered && onAnswerClick(option.key)}
                onMouseEnter={() => !isAnswered && setHoveredOption(option.key)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={isAnswered}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all duration-300
                  ${getOptionStyle(option.key)}
                  ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                  flex items-center space-x-4 min-h-[80px]
                `}
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg
                  ${isAnswered && option.key === correctAnswer ? 'border-green-400' :
                    isAnswered && option.key === selectedAnswer && option.key !== correctAnswer ? 'border-red-400' :
                    'border-current'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1 text-lg font-medium">{option.text}</span>
                {getOptionIcon(option.key)}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 text-center"
            >
              {selectedAnswer === correctAnswer ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 font-semibold text-lg">
                    🎉 Correto! Muito bem!
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 font-semibold text-lg">
                    ❌ Incorreto. A resposta certa era a alternativa {correctAnswer?.toUpperCase()}.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {showNextButton && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: 0.2 
              }}
              className="mt-8 text-center"
            >
              <motion.button
                onClick={onNextQuestion}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="
                  relative overflow-hidden
                  w-full md:w-auto min-w-[280px]
                  px-10 py-5
                  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600
                  hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700
                  text-white font-bold text-lg
                  rounded-2xl
                  shadow-2xl hover:shadow-blue-500/25
                  transition-all duration-300
                  border border-white/20
                  backdrop-blur-sm
                "
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Button content */}
                <div className="relative flex items-center justify-center space-x-3">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl"
                  >
                    ➡️
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Avançar para a próxima questão
                  </motion.span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}