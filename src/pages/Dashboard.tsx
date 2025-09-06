import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { PhaseSelector } from '../components/dashboard/PhaseSelector';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ProfileCard } from '../components/dashboard/ProfileCard';
import { DifficultLevel } from '../types/game';
import { useStats } from '../hooks/useStats';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const logo = 'https://i.postimg.cc/YSJChsxt/math-Fly-logo.png';

export function Dashboard() {
  const navigate = useNavigate();
  const { userStats, loading } = useStats();
  

  const handleSelectPhase = (level: DifficultLevel) => {
    navigate(`/quiz/${level}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div 
            className="inline-flex items-center justify-center w-64 h-64 logo"
            style={{ margin: '-50px 0' }}
          >
            <img 
              src={logo}
              alt="MathFly Logo" 
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total de Pontos"
            value={Number(userStats?.totalScore) || 0}
            icon={Target}
            color="from-indigo-500 to-violet-500"
          />
          <StatsCard
            title="Precisão Média"
            value={`${(Number(userStats?.averageAccuracy) || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Partidas Jogadas"
            value={userStats?.totalGames ?? 0}
            icon={Trophy}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Phase Selection */}
          <div className="lg:col-span-3">
            <PhaseSelector onSelectPhase={handleSelectPhase} userStats={userStats} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCard userStats={userStats} />
            {/* <RankingTable rankings={globalRanking} loading={loading} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}