import { motion } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';
import { Card } from '../ui/Card';
import { RankingEntry } from '../../types/game';

interface RankingTableProps {
  rankings: RankingEntry[];
  userRank?: number;
  loading?: boolean;
}

export function RankingTable({ rankings, userRank, loading }: RankingTableProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-yellow-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-slate-400 font-bold text-sm">#{position}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">🏆 Ranking Global</h3>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-xl">
                <div className="w-8 h-8 bg-slate-600 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
                <div className="h-6 bg-slate-600 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">🏆 Ranking Global</h3>
        {userRank && (
          <div className="text-sm text-slate-400">
            Sua posição: <span className="text-indigo-400 font-semibold">#{userRank}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {rankings.map((entry, index) => {
          const position = index + 1;
          const isTopThree = position <= 3;
          
          return (
            <motion.div
              key={`${entry.nome}-${entry.data_partida}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center space-x-4 p-3 rounded-xl transition-colors ${
                isTopThree 
                  ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-600/50' 
                  : 'bg-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(position)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${
                  isTopThree ? 'text-white' : 'text-slate-300'
                }`}>
                  {entry.nome}
                </p>
                <p className="text-xs text-slate-500">
                  Última atualização: {formatDate(entry.data_partida)}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold ${
                  position === 1 ? 'text-yellow-400' :
                  position === 2 ? 'text-gray-300' :
                  position === 3 ? 'text-yellow-600' :
                  'text-indigo-400'
                }`}>
                  {entry.pontuacao.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">pontos</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {rankings.length === 0 && !loading && (
        <div className="text-center py-8 text-slate-400">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum jogador no ranking ainda.</p>
          <p className="text-sm">Seja o primeiro a pontuar!</p>
        </div>
      )}
    </Card>
  );
}