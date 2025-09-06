import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { DifficultLevel } from '../types/game';

interface UserStats {
  totalScore: number;
  totalGames: number;
  averageAccuracy: number;
  bestPhase: DifficultLevel;
  lastPlayed: string;
  maxPhase: number;
}

interface RankingEntry {
  nome: string;
  pontuacao: number;
  data_partida: string;
}

interface Performance {
  id: string;
  phase: number;
  correct_answers: number;
  points_earned: number;
  completed_at: string;
  accuracy: number;
}

export function useStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [personalPerformance, setPersonalPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadUserStats = async () => {
    if (!user) {
      setUserStats({
        totalScore: 0,
        totalGames: 0,
        averageAccuracy: 0,
        bestPhase: 'facil' as DifficultLevel,
        lastPlayed: new Date().toISOString(),
        maxPhase: 1
      });
      return;
    }

    try {
      
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: results } = await supabase
        .from('phase_results')
        .select('correct_answers, completed_at')
        .eq('user_id', user.id);

      const progressData = progress && progress.length > 0 ? progress[0] : null;
      const totalScore = progressData?.total_points || 0;
      const totalGames = results?.length || 0;
      const totalCorrect = progressData?.total_correct || 0;
      const averageAccuracy = totalGames > 0 ? (totalCorrect / (totalGames * 5)) * 100 : 0;
      const maxPhase = progressData?.max_phase || 1;

      const stats: UserStats = {
        totalScore,
        totalGames,
        averageAccuracy,
        bestPhase: 'facil' as DifficultLevel,
        lastPlayed: results?.[0]?.completed_at || new Date().toISOString(),
        maxPhase
      };

      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setUserStats({
        totalScore: 0,
        totalGames: 0,
        averageAccuracy: 0,
        bestPhase: 'facil' as DifficultLevel,
        lastPlayed: new Date().toISOString(),
        maxPhase: 1
      });
    }
  };

  const loadGlobalRanking = async () => {
    try {
      
      const { data } = await supabase
        .from('user_progress')
        .select(`
          total_points,
          updated_at,
          users!inner(name)
        `)
        .order('total_points', { ascending: false })
        .limit(20);

      if (data) {
        const rankings: RankingEntry[] = data.map((entry: any) => ({
          nome: entry.users?.name || 'Usuário Anônimo',
          pontuacao: entry.total_points,
          data_partida: entry.updated_at
        }));
        setGlobalRanking(rankings);
      } else {
        setGlobalRanking([]);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      setGlobalRanking([]);
    }
  };

  const loadPersonalPerformance = async () => {
    if (!user) return;

    try {
      
      const { data } = await supabase
        .from('phase_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (data) {
        const performances: Performance[] = data.map((p: any) => ({
          ...p,
          accuracy: (p.correct_answers / 5) * 100
        }));
        setPersonalPerformance(performances);
      }
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
      setPersonalPerformance([]);
    }
  };

  const refreshStats = async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        loadUserStats(),
        loadGlobalRanking(),
        loadPersonalPerformance()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshStats();
    } else {
      setUserStats(null);
      setGlobalRanking([]);
      setPersonalPerformance([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    
    const subscription = supabase
      .channel('ranking_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress' },
        () => {
          loadGlobalRanking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    userStats,
    globalRanking,
    personalPerformance,
    loading,
    refreshStats
  };
}