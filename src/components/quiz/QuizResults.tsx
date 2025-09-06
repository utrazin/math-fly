import { motion } from 'framer-motion';
import { Trophy, Star, Clock, Target, TrendingUp, RotateCcw, Home, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DifficultLevel } from '../../types/game';
import { useStats } from '../../hooks/useStats';

interface QuizResultsProps {
  results: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    timeSpent: number;
    nivel: DifficultLevel;
  };
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
}

const LEVEL_NAMES = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
  expert: 'Expert'
};

export function QuizResults({
  results,
  onPlayAgain,
  onBackToDashboard,
  onNextLevel,
  hasNextLevel = false
}: QuizResultsProps) {
  const { userStats } = useStats();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (results.accuracy >= 90) return { 
      message: "Excelente! 🏆", 
      color: "text-yellow-400",
      description: "Desempenho excepcional!"
    };
    if (results.accuracy >= 70) return { 
      message: "Muito bom! 🌟", 
      color: "text-green-400",
      description: "Ótimo trabalho!"
    };
    if (results.accuracy >= 50) return { 
      message: "Bom trabalho! 👍", 
      color: "text-blue-400",
      description: "Continue assim!"
    };
    return { 
      message: "Continue praticando! 💪", 
      color: "text-orange-400",
      description: "Você vai melhorar!"
    };
  };

  const performance = getPerformanceMessage();

  // Dados para o gráfico circular
  const chartData = [
    { name: 'Corretas', value: results.correctAnswers, color: '#10b981' },
    { name: 'Incorretas', value: results.totalQuestions - results.correctAnswers, color: '#ef4444' }
  ];
  
  // Verificar se desbloqueou nova fase
  const unlockedNewPhase = results.correctAnswers >= 3;
  const currentPhaseNumber = ['facil', 'medio', 'dificil', 'expert'].indexOf(results.nivel) + 1;
  const maxPhase = userStats?.maxPhase || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-3xl font-bold ${performance.color} mb-2`}>
              {performance.message}
            </h2>
            <p className="text-slate-400 text-lg">{performance.description}</p>
            <p className="text-slate-500">
              Nível: <span className="capitalize font-semibold text-white">{LEVEL_NAMES[results.nivel]}</span>
            </p>
            
            {/* Mensagem de desbloqueio de nova fase */}
            {unlockedNewPhase && currentPhaseNumber < 4 && currentPhaseNumber >= maxPhase - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <div className="text-center">
                    <p className="text-green-400 font-bold">Nova Fase Desbloqueada!</p>
                    <p className="text-sm text-slate-300">Você pode agora acessar a próxima fase!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estatísticas */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{results.score.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Pontos</p>
                  </div>

                  <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{results.correctAnswers}/{results.totalQuestions}</p>
                    <p className="text-sm text-slate-400">Acertos</p>
                  </div>

                  <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{results.accuracy.toFixed(1)}%</p>
                    <p className="text-sm text-slate-400">Precisão</p>
                  </div>

                  <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{formatTime(results.timeSpent)}</p>
                    <p className="text-sm text-slate-400">Tempo</p>
                  </div>
                </div>
              </motion.div>

              {/* Barra de progresso da precisão */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Precisão Geral</span>
                  <span>{results.accuracy.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${results.accuracy}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Gráfico Circular */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">📈 Desempenho</h3>
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Corretas ({results.correctAnswers})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Incorretas ({results.totalQuestions - results.correctAnswers})</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-700"
          >
            <Button 
              variant="primary" 
              onClick={onPlayAgain}
              className="flex-1 text-lg py-4"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Jogar Novamente
            </Button>
            
            {hasNextLevel && onNextLevel && (
              <Button 
                variant="secondary" 
                onClick={onNextLevel}
                className="flex-1 text-lg py-4"
              >
                Próximo Nível
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={onBackToDashboard}
              className="flex-1 text-lg py-4"
            >
              <Home className="w-5 h-5 mr-2" />
              Menu Principal
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}