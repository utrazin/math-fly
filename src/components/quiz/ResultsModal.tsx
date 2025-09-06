import { motion } from 'framer-motion';
import { Trophy, Star, Clock, Target, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { DifficultLevel } from '../../types/game';

interface QuizResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  nivel: DifficultLevel;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: QuizResults;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

export function ResultsModal({
  isOpen,
  onClose,
  results,
  onPlayAgain,
  onBackToDashboard
}: ResultsModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (results.accuracy >= 90) return { message: "Excelente! 🏆", color: "text-yellow-400" };
    if (results.accuracy >= 70) return { message: "Muito bom! 🌟", color: "text-green-400" };
    if (results.accuracy >= 50) return { message: "Bom trabalho! 👍", color: "text-blue-400" };
    return { message: "Continue praticando! 💪", color: "text-orange-400" };
  };

  const performance = getPerformanceMessage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resultados do Quiz" size="lg">
      <div className="space-y-8">
        {/* Header com performance */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h3 
            className={`text-2xl font-bold ${performance.color} mb-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {performance.message}
          </motion.h3>
          <p className="text-slate-400">Nível: <span className="capitalize font-semibold text-white">{results.nivel}</span></p>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            className="text-center p-4 bg-slate-700/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{results.score}</p>
            <p className="text-sm text-slate-400">Pontos</p>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-slate-700/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{results.correctAnswers}/{results.totalQuestions}</p>
            <p className="text-sm text-slate-400">Acertos</p>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-slate-700/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{results.accuracy.toFixed(1)}%</p>
            <p className="text-sm text-slate-400">Precisão</p>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-slate-700/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatTime(results.timeSpent)}</p>
            <p className="text-sm text-slate-400">Tempo</p>
          </motion.div>
        </div>

        {/* Barra de progresso da precisão */}
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Precisão</span>
            <span>{results.accuracy.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${results.accuracy}%` }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            variant="primary" 
            onClick={onPlayAgain}
            className="flex-1 text-lg py-4"
          >
            🎮 Jogar Novamente
          </Button>
          <Button 
            variant="secondary" 
            onClick={onBackToDashboard}
            className="flex-1 text-lg py-4"
          >
            🏠 Voltar ao Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
}