import { motion } from 'framer-motion';
import { Play, Clock, Target, Trophy, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DifficultLevel } from '../../types/game';

interface QuizIntroProps {
  level: DifficultLevel;
  onStart: () => void;
  onBack?: () => void;
  totalQuestions: number;
  timePerQuestion?: number;
}

const LEVEL_CONFIG = {
  facil: {
    name: 'Fácil',
    description: 'Aritmética básica e operações fundamentais',
    color: 'from-green-500 to-emerald-500',
    icon: '🟢',
    points: 10
  },
  medio: {
    name: 'Médio',
    description: 'Frações, decimais e geometria básica',
    color: 'from-blue-500 to-cyan-500',
    icon: '🔵',
    points: 20
  },
  dificil: {
    name: 'Difícil',
    description: 'Álgebra, equações e geometria avançada',
    color: 'from-orange-500 to-red-500',
    icon: '🟠',
    points: 30
  },
  expert: {
    name: 'Expert',
    description: 'Conceitos avançados e problemas complexos',
    color: 'from-purple-500 to-pink-500',
    icon: '🟣',
    points: 50
  }
};

export function QuizIntro({ level, onStart, onBack, totalQuestions, timePerQuestion = 30 }: QuizIntroProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 text-center relative">
          {/* Back Button */}
          {onBack && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-6 left-6"
            >
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-4xl`}>
              {config.icon}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Nível {config.name}
            </h1>
            <p className="text-slate-400 text-lg">
              {config.description}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-slate-700/30 rounded-xl p-4">
              <Target className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
              <p className="text-sm text-slate-400">Perguntas</p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{timePerQuestion}s</p>
              <p className="text-sm text-slate-400">Por pergunta</p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{config.points}</p>
              <p className="text-sm text-slate-400">Pontos base</p>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="bg-slate-700/20 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Instruções:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>Responda {totalQuestions} perguntas sobre matemática</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>Você tem {timePerQuestion} segundos para cada pergunta</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>Ganhe pontos extras respondendo rapidamente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>Seu progresso será salvo automaticamente</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={onStart}
              size="lg"
              className="w-full md:w-auto px-12 py-4 text-xl"
            >
              <Play className="w-6 h-6 mr-2" />
              Começar Quiz
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}