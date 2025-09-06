import { motion } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { UserStats } from '../../types/game';

interface ProfileCardProps {
  userStats: UserStats | null;
}

export function ProfileCard({ userStats }: ProfileCardProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-700"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{user?.user_metadata?.name || 'Usuário'}</h3>
          <p className="text-sm text-slate-400 truncate" title={user?.email}>{user?.email}</p>
        </div>
      </div>

      {userStats && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
              <motion.p 
                className="text-2xl font-bold text-indigo-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {userStats.totalScore.toLocaleString()}
              </motion.p>
              <p className="text-xs text-slate-400">Total de Pontos</p>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
              <motion.p 
                className="text-2xl font-bold text-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {userStats.averageAccuracy.toFixed(1)}%
              </motion.p>
              <p className="text-xs text-slate-400">Precisão</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-slate-700/30 rounded-xl">
            <motion.p 
              className="text-xl font-bold text-violet-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userStats.totalGames}
            </motion.p>
            <p className="text-xs text-slate-400">Partidas Jogadas</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSettingsClick}>
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </Card>
  );
}