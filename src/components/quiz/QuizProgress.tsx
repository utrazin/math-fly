import { motion } from 'framer-motion';
import { Clock, Star } from 'lucide-react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  maxTime: number;
}

export function QuizProgress({ 
  currentQuestion, 
  totalQuestions, 
  score, 
  timeLeft, 
  maxTime 
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  const timeProgress = (timeLeft / maxTime) * 100;

  return (
    <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        {/* Question Progress */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">
            Pergunta {currentQuestion} de {totalQuestions}
          </span>
          <div className="w-48 bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-sm font-medium text-indigo-400">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <motion.span 
            className="text-lg font-bold text-yellow-400"
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {score.toLocaleString()}
          </motion.span>
          <span className="text-sm text-slate-400">pontos</span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center space-x-3">
        <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`} />
        <div className="flex-1 max-w-xs bg-slate-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${
              timeLeft <= 10 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : timeLeft <= 20
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                : 'bg-gradient-to-r from-green-500 to-blue-500'
            }`}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <motion.span 
          className={`font-mono text-lg font-bold ${
            timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'
          }`}
          animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
        >
          {timeLeft}s
        </motion.span>
      </div>
    </div>
  );
}