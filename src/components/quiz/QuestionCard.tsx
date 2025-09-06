import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface QuestionCardProps {
  question: {
    id_pergunta: string;
    enunciado: string;
    alternativa_a: string;
    alternativa_b: string;
    alternativa_c: string;
    alternativa_d: string;
    resposta_correta: string;
    nivel: string;
  };
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  onAnswer: (answer: string) => void;
  isAnswered?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  onAnswer,
  isAnswered = false
}: QuestionCardProps) {
  const options = [
    { key: 'a', text: question.alternativa_a },
    { key: 'b', text: question.alternativa_b },
    { key: 'c', text: question.alternativa_c },
    { key: 'd', text: question.alternativa_d }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Questão {questionNumber} de {totalQuestions}
          </span>
          <div className="w-48 bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <span className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 leading-relaxed">
            {question.enunciado}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.nivel === 'facil' ? 'bg-green-500/20 text-green-400' :
              question.nivel === 'medio' ? 'bg-yellow-500/20 text-yellow-400' :
              question.nivel === 'dificil' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {question.nivel.charAt(0).toUpperCase() + question.nivel.slice(1)}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.button
              key={option.key}
              whileHover={!isAnswered ? { scale: 1.02 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => !isAnswered && onAnswer(option.key)}
              disabled={isAnswered}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 
                ${!isAnswered 
                  ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-indigo-500' 
                  : 'bg-slate-800 border-slate-700'
                }
                ${isAnswered ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                flex items-center space-x-4
              `}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold
                ${!isAnswered ? 'border-current' : 'border-slate-600'}
              `}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-1 text-lg">{option.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}