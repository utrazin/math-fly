import { motion } from 'framer-motion';
import { Play, Lock, Star, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DifficultLevel } from '../../types/game';
import { useStats } from '../../hooks/useStats';

interface Phase {
  id: DifficultLevel;
  name: string;
  description: string;
  color: string;
  difficulty: number;
  unlocked: boolean;
  completed: boolean;
  bestScore?: number;
  requiredCorrectAnswers: number;
}

interface PhaseSelectorProps {
  onSelectPhase: (level: DifficultLevel) => void;
  userStats: any;
}

export function PhaseSelector({ onSelectPhase, userStats }: PhaseSelectorProps) {
  const { personalPerformance } = useStats();

  const getGradientColors = (gradientClass: string) => {
    const colorMap: { [key: string]: string } = {
      'from-green-500 to-emerald-500': '#10b981, #059669',
      'from-blue-500 to-cyan-500': '#3b82f6, #06b6d4',
      'from-orange-500 to-red-500': '#f97316, #ef4444',
      'from-purple-500 to-pink-500': '#8b5cf6, #ec4899'
    };
    return colorMap[gradientClass] || '#6b7280, #6b7280';
  };

  const maxPhase = userStats?.maxPhase || 1;
  
  const getPhaseUnlockStatus = (difficulty: number) => {
    return difficulty <= maxPhase;
  };

  const isPhaseCompleted = (difficulty: number) => {
    const phaseResults = personalPerformance.filter(p => p.phase === difficulty);
    return phaseResults.some(result => result.correct_answers >= 3);
  };

  const getBestScore = (difficulty: number) => {
    const phaseResults = personalPerformance.filter(p => p.phase === difficulty);
    if (phaseResults.length === 0) return undefined;
    return Math.max(...phaseResults.map(r => r.points_earned));
  };

  const phases: Phase[] = [
    {
      id: 'facil',
      name: 'Fácil',
      description: 'Aritmética básica e operações fundamentais',
      color: 'from-green-500 to-emerald-500',
      difficulty: 1,
      unlocked: getPhaseUnlockStatus(1),
      completed: isPhaseCompleted(1),
      bestScore: getBestScore(1),
      requiredCorrectAnswers: 3
    },
    {
      id: 'medio',
      name: 'Médio',
      description: 'Frações, decimais e geometria básica',
      color: 'from-blue-500 to-cyan-500',
      difficulty: 2,
      unlocked: getPhaseUnlockStatus(2),
      completed: isPhaseCompleted(2),
      bestScore: getBestScore(2),
      requiredCorrectAnswers: 3
    },
    {
      id: 'dificil',
      name: 'Difícil',
      description: 'Álgebra, equações e geometria avançada',
      color: 'from-orange-500 to-red-500',
      difficulty: 3,
      unlocked: getPhaseUnlockStatus(3),
      completed: isPhaseCompleted(3),
      bestScore: getBestScore(3),
      requiredCorrectAnswers: 3
    },
    {
      id: 'expert',
      name: 'Expert',
      description: 'Conceitos avançados e problemas complexos',
      color: 'from-purple-500 to-pink-500',
      difficulty: 4,
      unlocked: getPhaseUnlockStatus(4),
      completed: isPhaseCompleted(4),
      bestScore: getBestScore(4),
      requiredCorrectAnswers: 3
    }
  ];

  const getUnlockMessage = (phase: Phase) => {
    if (phase.difficulty <= maxPhase) return null;
    
    const previousPhaseName = phases[phase.difficulty - 2]?.name;
    return `Acerte pelo menos ${phase.requiredCorrectAnswers} questões na fase ${previousPhaseName} para desbloquear`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Escolha sua Fase</h2>
        <p className="text-slate-400">Selecione o nível de dificuldade para começar</p>
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-300">
            💡 <strong>Dica:</strong> Você precisa acertar pelo menos <strong>3 questões</strong> em cada fase para desbloquear a próxima!
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Fases desbloqueadas: <strong>{maxPhase}/4</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              hover={phase.unlocked}
              onClick={phase.unlocked ? () => onSelectPhase(phase.id) : undefined}
              className={`relative overflow-hidden h-80 ${
                !phase.unlocked ? 'opacity-60' : ''
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-10`} />
              
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${phase.color}`} />
                    <span className="text-sm text-slate-400">Nível {phase.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!phase.unlocked && <Lock className="w-5 h-5 text-slate-500" />}
                    {phase.completed && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {phase.unlocked && !phase.completed && <Star className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{phase.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {phase.description}
                  </p>
                  
                  {/* Progress Info */}
                  <div className="space-y-3">
                    {phase.bestScore && (
                      <div className="p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Melhor Pontuação</p>
                        <p className="text-lg font-bold text-yellow-400">{phase.bestScore}</p>
                      </div>
                    )}

                    {!phase.unlocked && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lock className="w-4 h-4 text-orange-400" />
                          <p className="text-sm text-orange-400 font-medium">Bloqueada</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {getUnlockMessage(phase)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="mt-auto">
                  {phase.unlocked && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPhase(phase.id);
                      }}
                    >
                      {phase.completed ? (
                        <>
                          <Play className="w-4 h-4" />
                          Jogar Novamente
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Jogar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Seu Progresso</h3>
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="text-center relative">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center relative z-10`}>
                    {phase.completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : phase.unlocked ? (
                      <Star className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white opacity-50" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">{phase.name}</p>
                  <p className="text-xs text-slate-400">
                    {phase.completed ? 'Concluída' : phase.unlocked ? 'Disponível' : 'Bloqueada'}
                  </p>
                  
                  {/* Connection Line */}
                  {index < phases.length - 1 && phase.completed && (
                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 z-0">
                      <div 
                        className="h-full bg-gradient-to-r"
                        style={{
                          background: `linear-gradient(to right, ${getGradientColors(phase.color)}, ${getGradientColors(phases[index + 1].color)})`
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}