import { supabase } from '../lib/supabase';
import { Question, DifficultLevel } from '../types/game';

const LEVEL_TO_PHASE: Record<DifficultLevel, number> = {
  facil: 1,
  medio: 2,
  dificil: 3,
  expert: 4
};


export class QuizService {
  static async getQuestionsByPhase(nivel: DifficultLevel, limit: number = 5): Promise<Question[]> {
    try {
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('nivel', nivel)
        .order('id', { ascending: true });

      if (error) {
        console.error('Erro ao buscar questões (tabela não existe?):', error);
        return this.getMockQuestionsWithShuffle(nivel, limit);
      }

      if (!data || data.length === 0) {
        return this.getMockQuestionsWithShuffle(nivel, limit);
      }


      const shuffledQuestions = this.shuffleArray([...data]);
      
      
      const selectedQuestions = shuffledQuestions.slice(0, limit);
      

      return selectedQuestions;
    } catch (error) {
      console.error('Erro no serviço de questões:', error);
      return this.getMockQuestionsWithShuffle(nivel, limit);
    }
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  static async saveQuizResult(
    userId: string, 
    results: {
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      accuracy: number;
      timeSpent: number;
      nivel: DifficultLevel;
    }
  ) {
    try {
      
      const phase = LEVEL_TO_PHASE[results.nivel];
      
      const { error: resultError } = await supabase
        .from('phase_results')
        .insert({
          user_id: userId,
          phase: phase,
          correct_answers: results.correctAnswers,
          points_earned: results.score,
          completed_at: new Date().toISOString()
        });

      if (resultError) {
        console.error('Erro ao salvar resultado da fase:', resultError);
        throw resultError;
      }

      const { data: currentProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', progressError);
        throw progressError;
      }

      let newMaxPhase = currentProgress?.max_phase || 1;
      
      if (results.correctAnswers >= 3 && phase >= newMaxPhase) {
        newMaxPhase = Math.min(phase + 1, 4);
      }

      const progressData = {
        user_id: userId,
        max_phase: newMaxPhase,
        total_correct: (currentProgress?.total_correct || 0) + results.correctAnswers,
        total_points: (currentProgress?.total_points || 0) + results.score,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert(progressData, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Erro ao atualizar progresso:', upsertError);
        throw upsertError;
      }

      
      return {
        success: true,
        newMaxPhase,
        unlockedNewPhase: newMaxPhase > (currentProgress?.max_phase || 1)
      };
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      throw error;
    }
  }

  static async getUserMaxPhase(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('max_phase')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar max_phase:', error);
        return 1;
      }

      return data?.max_phase || 1;
    } catch (error) {
      console.error('Erro ao buscar max_phase:', error);
      return 1;
    }
  }

  static saveOfflineProgress(results: any) {
    try {
      const offlineData = localStorage.getItem('mathfly_offline_progress') || '[]';
      const progress = JSON.parse(offlineData);
      progress.push({
        ...results,
        timestamp: Date.now(),
        synced: false
      });
      localStorage.setItem('mathfly_offline_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Erro ao salvar offline:', error);
    }
  }

  private static getMockQuestionsWithShuffle(nivel: DifficultLevel, limit: number): Question[] {
    const allMockQuestions = this.getMockQuestions(nivel, 100);
    
    if (allMockQuestions.length === 0) {
      return [];
    }
    
    
    const shuffledQuestions = this.shuffleArray([...allMockQuestions]);
    
    
    const selectedQuestions = shuffledQuestions.slice(0, limit);
    
    return selectedQuestions;
  }

  private static getMockQuestions(nivel: DifficultLevel, limit: number): Question[] {
    const mockQuestions: Record<DifficultLevel, Question[]> = {
    facil: [
      {
        "id_pergunta": "f1",
        "enunciado": "Quanto é 15 + 27?",
        "alternativa_a": "42",
        "alternativa_b": "41",
        "alternativa_c": "43",
        "alternativa_d": "40",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f2",
        "enunciado": "Quanto é 8 × 7?",
        "alternativa_a": "54",
        "alternativa_b": "56",
        "alternativa_c": "58",
        "alternativa_d": "52",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f3",
        "enunciado": "Quanto é 100 - 37?",
        "alternativa_a": "63",
        "alternativa_b": "73",
        "alternativa_c": "67",
        "alternativa_d": "53",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f4",
        "enunciado": "Quanto é 144 ÷ 12?",
        "alternativa_a": "11",
        "alternativa_b": "13",
        "alternativa_c": "12",
        "alternativa_d": "14",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f5",
        "enunciado": "Quanto é 25 + 38?",
        "alternativa_a": "63",
        "alternativa_b": "61",
        "alternativa_c": "65",
        "alternativa_d": "67",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f6",
        "enunciado": "Quanto é 12 × 4?",
        "alternativa_a": "46",
        "alternativa_b": "48",
        "alternativa_c": "44",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f7",
        "enunciado": "Quanto é 75 - 25?",
        "alternativa_a": "50",
        "alternativa_b": "45",
        "alternativa_c": "55",
        "alternativa_d": "60",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f8",
        "enunciado": "Quanto é 90 ÷ 9?",
        "alternativa_a": "8",
        "alternativa_b": "9",
        "alternativa_c": "10",
        "alternativa_d": "11",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f9",
        "enunciado": "Quanto é 18 + 52?",
        "alternativa_a": "68",
        "alternativa_b": "70",
        "alternativa_c": "69",
        "alternativa_d": "71",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f10",
        "enunciado": "Quanto é 6 × 9?",
        "alternativa_a": "45",
        "alternativa_b": "54",
        "alternativa_c": "63",
        "alternativa_d": "48",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f11",
        "enunciado": "Quanto é 88 - 33?",
        "alternativa_a": "45",
        "alternativa_b": "55",
        "alternativa_c": "65",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f12",
        "enunciado": "Quanto é 200 ÷ 10?",
        "alternativa_a": "15",
        "alternativa_b": "20",
        "alternativa_c": "25",
        "alternativa_d": "30",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f13",
        "enunciado": "Quanto é 45 + 15?",
        "alternativa_a": "50",
        "alternativa_b": "65",
        "alternativa_c": "60",
        "alternativa_d": "70",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f14",
        "enunciado": "Quanto é 7 × 7?",
        "alternativa_a": "42",
        "alternativa_b": "56",
        "alternativa_c": "49",
        "alternativa_d": "64",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f15",
        "enunciado": "Quanto é 120 - 50?",
        "alternativa_a": "60",
        "alternativa_b": "70",
        "alternativa_c": "80",
        "alternativa_d": "75",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f16",
        "enunciado": "Quanto é 81 ÷ 9?",
        "alternativa_a": "8",
        "alternativa_b": "7",
        "alternativa_c": "9",
        "alternativa_d": "6",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f17",
        "enunciado": "Quanto é 30 + 45?",
        "alternativa_a": "70",
        "alternativa_b": "85",
        "alternativa_c": "75",
        "alternativa_d": "65",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f18",
        "enunciado": "Quanto é 4 × 11?",
        "alternativa_a": "42",
        "alternativa_b": "44",
        "alternativa_c": "48",
        "alternativa_d": "40",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f19",
        "enunciado": "Quanto é 95 - 15?",
        "alternativa_a": "80",
        "alternativa_b": "70",
        "alternativa_c": "85",
        "alternativa_d": "75",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f20",
        "enunciado": "Quanto é 50 ÷ 5?",
        "alternativa_a": "8",
        "alternativa_b": "10",
        "alternativa_c": "12",
        "alternativa_d": "5",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f21",
        "enunciado": "Quanto é 22 + 33?",
        "alternativa_a": "50",
        "alternativa_b": "55",
        "alternativa_c": "60",
        "alternativa_d": "65",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f22",
        "enunciado": "Quanto é 3 × 15?",
        "alternativa_a": "40",
        "alternativa_b": "45",
        "alternativa_c": "50",
        "alternativa_d": "55",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f23",
        "enunciado": "Quanto é 100 - 80?",
        "alternativa_a": "10",
        "alternativa_b": "15",
        "alternativa_c": "20",
        "alternativa_d": "25",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f24",
        "enunciado": "Quanto é 100 ÷ 4?",
        "alternativa_a": "20",
        "alternativa_b": "25",
        "alternativa_c": "30",
        "alternativa_d": "35",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f25",
        "enunciado": "Quanto é 50 + 50?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f26",
        "enunciado": "Quanto é 9 × 8?",
        "alternativa_a": "64",
        "alternativa_b": "72",
        "alternativa_c": "81",
        "alternativa_d": "90",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f27",
        "enunciado": "Quanto é 45 - 20?",
        "alternativa_a": "20",
        "alternativa_b": "25",
        "alternativa_c": "30",
        "alternativa_d": "35",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f28",
        "enunciado": "Quanto é 64 ÷ 8?",
        "alternativa_a": "7",
        "alternativa_b": "9",
        "alternativa_c": "8",
        "alternativa_d": "6",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f29",
        "enunciado": "Quanto é 19 + 21?",
        "alternativa_a": "30",
        "alternativa_b": "35",
        "alternativa_c": "40",
        "alternativa_d": "45",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f30",
        "enunciado": "Quanto é 5 × 12?",
        "alternativa_a": "50",
        "alternativa_b": "60",
        "alternativa_c": "70",
        "alternativa_d": "80",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f31",
        "enunciado": "Quanto é 150 - 75?",
        "alternativa_a": "65",
        "alternativa_b": "75",
        "alternativa_c": "80",
        "alternativa_d": "85",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f32",
        "enunciado": "Quanto é 36 ÷ 6?",
        "alternativa_a": "5",
        "alternativa_b": "7",
        "alternativa_c": "6",
        "alternativa_d": "8",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f33",
        "enunciado": "Quanto é 40 + 60?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f34",
        "enunciado": "Quanto é 8 × 6?",
        "alternativa_a": "42",
        "alternativa_b": "48",
        "alternativa_c": "54",
        "alternativa_d": "60",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f35",
        "enunciado": "Quanto é 85 - 25?",
        "alternativa_a": "50",
        "alternativa_b": "55",
        "alternativa_c": "60",
        "alternativa_d": "65",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f36",
        "enunciado": "Quanto é 48 ÷ 4?",
        "alternativa_a": "10",
        "alternativa_b": "11",
        "alternativa_c": "12",
        "alternativa_d": "13",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f37",
        "enunciado": "Quanto é 24 + 16?",
        "alternativa_a": "30",
        "alternativa_b": "40",
        "alternativa_c": "50",
        "alternativa_d": "35",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f38",
        "enunciado": "Quanto é 10 × 10?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f39",
        "enunciado": "Quanto é 70 - 15?",
        "alternativa_a": "50",
        "alternativa_b": "55",
        "alternativa_c": "60",
        "alternativa_d": "65",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f40",
        "enunciado": "Quanto é 121 ÷ 11?",
        "alternativa_a": "10",
        "alternativa_b": "11",
        "alternativa_c": "12",
        "alternativa_d": "9",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f41",
        "enunciado": "Quanto é 35 + 28?",
        "alternativa_a": "61",
        "alternativa_b": "63",
        "alternativa_c": "65",
        "alternativa_d": "60",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f42",
        "enunciado": "Quanto é 7 × 13?",
        "alternativa_a": "81",
        "alternativa_b": "91",
        "alternativa_c": "101",
        "alternativa_d": "78",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f43",
        "enunciado": "Quanto é 99 - 49?",
        "alternativa_a": "40",
        "alternativa_b": "50",
        "alternativa_c": "60",
        "alternativa_d": "55",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f44",
        "enunciado": "Quanto é 72 ÷ 9?",
        "alternativa_a": "6",
        "alternativa_b": "7",
        "alternativa_c": "8",
        "alternativa_d": "9",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f45",
        "enunciado": "Quanto é 11 + 99?",
        "alternativa_a": "100",
        "alternativa_b": "110",
        "alternativa_c": "111",
        "alternativa_d": "109",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f46",
        "enunciado": "Quanto é 6 × 14?",
        "alternativa_a": "82",
        "alternativa_b": "84",
        "alternativa_c": "86",
        "alternativa_d": "88",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f47",
        "enunciado": "Quanto é 200 - 150?",
        "alternativa_a": "40",
        "alternativa_b": "50",
        "alternativa_c": "60",
        "alternativa_d": "70",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f48",
        "enunciado": "Quanto é 150 ÷ 15?",
        "alternativa_a": "10",
        "alternativa_b": "12",
        "alternativa_c": "15",
        "alternativa_d": "20",
        "resposta_correta": "a",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f49",
        "enunciado": "Quanto é 55 + 25?",
        "alternativa_a": "70",
        "alternativa_b": "75",
        "alternativa_c": "80",
        "alternativa_d": "85",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f50",
        "enunciado": "Quanto é 4 × 25?",
        "alternativa_a": "75",
        "alternativa_b": "100",
        "alternativa_c": "125",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f51",
        "enunciado": "Quanto é 65 - 35?",
        "alternativa_a": "20",
        "alternativa_b": "30",
        "alternativa_c": "40",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f52",
        "enunciado": "Quanto é 130 ÷ 10?",
        "alternativa_a": "11",
        "alternativa_b": "12",
        "alternativa_c": "13",
        "alternativa_d": "14",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f53",
        "enunciado": "Quanto é 75 + 25?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f54",
        "enunciado": "Quanto é 8 × 12?",
        "alternativa_a": "94",
        "alternativa_b": "96",
        "alternativa_c": "100",
        "alternativa_d": "98",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f55",
        "enunciado": "Quanto é 175 - 50?",
        "alternativa_a": "120",
        "alternativa_b": "125",
        "alternativa_c": "130",
        "alternativa_d": "115",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f56",
        "enunciado": "Quanto é 100 ÷ 20?",
        "alternativa_a": "4",
        "alternativa_b": "5",
        "alternativa_c": "6",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f57",
        "enunciado": "Quanto é 10 + 90?",
        "alternativa_a": "90",
        "alternativa_b": "110",
        "alternativa_c": "100",
        "alternativa_d": "105",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f58",
        "enunciado": "Quanto é 9 × 5?",
        "alternativa_a": "40",
        "alternativa_b": "45",
        "alternativa_c": "50",
        "alternativa_d": "55",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f59",
        "enunciado": "Quanto é 80 - 40?",
        "alternativa_a": "30",
        "alternativa_b": "40",
        "alternativa_c": "50",
        "alternativa_d": "60",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f60",
        "enunciado": "Quanto é 250 ÷ 25?",
        "alternativa_a": "5",
        "alternativa_b": "8",
        "alternativa_c": "10",
        "alternativa_d": "12",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f61",
        "enunciado": "Quanto é 12 + 13?",
        "alternativa_a": "20",
        "alternativa_b": "25",
        "alternativa_c": "30",
        "alternativa_d": "35",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f62",
        "enunciado": "Quanto é 7 × 8?",
        "alternativa_a": "54",
        "alternativa_b": "56",
        "alternativa_c": "64",
        "alternativa_d": "48",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f63",
        "enunciado": "Quanto é 110 - 60?",
        "alternativa_a": "40",
        "alternativa_b": "50",
        "alternativa_c": "60",
        "alternativa_d": "70",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f64",
        "enunciado": "Quanto é 80 ÷ 10?",
        "alternativa_a": "6",
        "alternativa_b": "7",
        "alternativa_c": "8",
        "alternativa_d": "9",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f65",
        "enunciado": "Quanto é 40 + 35?",
        "alternativa_a": "70",
        "alternativa_b": "75",
        "alternativa_c": "80",
        "alternativa_d": "85",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f66",
        "enunciado": "Quanto é 5 × 11?",
        "alternativa_a": "50",
        "alternativa_b": "55",
        "alternativa_c": "60",
        "alternativa_d": "65",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f67",
        "enunciado": "Quanto é 90 - 45?",
        "alternativa_a": "40",
        "alternativa_b": "45",
        "alternativa_c": "50",
        "alternativa_d": "55",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f68",
        "enunciado": "Quanto é 99 ÷ 9?",
        "alternativa_a": "9",
        "alternativa_b": "10",
        "alternativa_c": "11",
        "alternativa_d": "12",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f69",
        "enunciado": "Quanto é 25 + 75?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f70",
        "enunciado": "Quanto é 10 × 8?",
        "alternativa_a": "70",
        "alternativa_b": "80",
        "alternativa_c": "90",
        "alternativa_d": "100",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f71",
        "enunciado": "Quanto é 135 - 35?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f72",
        "enunciado": "Quanto é 169 ÷ 13?",
        "alternativa_a": "11",
        "alternativa_b": "12",
        "alternativa_c": "13",
        "alternativa_d": "14",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f73",
        "enunciado": "Quanto é 21 + 29?",
        "alternativa_a": "40",
        "alternativa_b": "45",
        "alternativa_c": "50",
        "alternativa_d": "55",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f74",
        "enunciado": "Quanto é 6 × 6?",
        "alternativa_a": "30",
        "alternativa_b": "32",
        "alternativa_c": "34",
        "alternativa_d": "36",
        "resposta_correta": "d",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f75",
        "enunciado": "Quanto é 50 - 23?",
        "alternativa_a": "25",
        "alternativa_b": "27",
        "alternativa_c": "30",
        "alternativa_d": "32",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f76",
        "enunciado": "Quanto é 49 ÷ 7?",
        "alternativa_a": "6",
        "alternativa_b": "7",
        "alternativa_c": "8",
        "alternativa_d": "9",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f77",
        "enunciado": "Quanto é 50 + 60?",
        "alternativa_a": "100",
        "alternativa_b": "110",
        "alternativa_c": "120",
        "alternativa_d": "130",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f78",
        "enunciado": "Quanto é 7 × 10?",
        "alternativa_a": "60",
        "alternativa_b": "70",
        "alternativa_c": "80",
        "alternativa_d": "90",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f79",
        "enunciado": "Quanto é 180 - 80?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f80",
        "enunciado": "Quanto é 225 ÷ 15?",
        "alternativa_a": "10",
        "alternativa_b": "15",
        "alternativa_c": "20",
        "alternativa_d": "25",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f81",
        "enunciado": "Quanto é 42 + 42?",
        "alternativa_a": "80",
        "alternativa_b": "84",
        "alternativa_c": "88",
        "alternativa_d": "92",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f82",
        "enunciado": "Quanto é 11 × 11?",
        "alternativa_a": "111",
        "alternativa_b": "121",
        "alternativa_c": "131",
        "alternativa_d": "141",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f83",
        "enunciado": "Quanto é 200 - 101?",
        "alternativa_a": "90",
        "alternativa_b": "95",
        "alternativa_c": "99",
        "alternativa_d": "100",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f84",
        "enunciado": "Quanto é 108 ÷ 12?",
        "alternativa_a": "8",
        "alternativa_b": "9",
        "alternativa_c": "10",
        "alternativa_d": "11",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f85",
        "enunciado": "Quanto é 58 + 12?",
        "alternativa_a": "60",
        "alternativa_b": "65",
        "alternativa_c": "70",
        "alternativa_d": "75",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f86",
        "enunciado": "Quanto é 9 × 9?",
        "alternativa_a": "72",
        "alternativa_b": "81",
        "alternativa_c": "90",
        "alternativa_d": "99",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f87",
        "enunciado": "Quanto é 160 - 40?",
        "alternativa_a": "100",
        "alternativa_b": "110",
        "alternativa_c": "120",
        "alternativa_d": "130",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f88",
        "enunciado": "Quanto é 300 ÷ 100?",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "3",
        "alternativa_d": "4",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f89",
        "enunciado": "Quanto é 33 + 17?",
        "alternativa_a": "40",
        "alternativa_b": "45",
        "alternativa_c": "50",
        "alternativa_d": "55",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f90",
        "enunciado": "Quanto é 4 × 15?",
        "alternativa_a": "50",
        "alternativa_b": "60",
        "alternativa_c": "70",
        "alternativa_d": "80",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f91",
        "enunciado": "Quanto é 75 - 50?",
        "alternativa_a": "15",
        "alternativa_b": "20",
        "alternativa_c": "25",
        "alternativa_d": "30",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f92",
        "enunciado": "Quanto é 24 ÷ 3?",
        "alternativa_a": "6",
        "alternativa_b": "7",
        "alternativa_c": "8",
        "alternativa_d": "9",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f93",
        "enunciado": "Quanto é 65 + 15?",
        "alternativa_a": "70",
        "alternativa_b": "80",
        "alternativa_c": "90",
        "alternativa_d": "100",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f94",
        "enunciado": "Quanto é 7 × 9?",
        "alternativa_a": "54",
        "alternativa_b": "63",
        "alternativa_c": "72",
        "alternativa_d": "81",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f95",
        "enunciado": "Quanto é 145 - 25?",
        "alternativa_a": "110",
        "alternativa_b": "115",
        "alternativa_c": "120",
        "alternativa_d": "130",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f96",
        "enunciado": "Quanto é 180 ÷ 12?",
        "alternativa_a": "12",
        "alternativa_b": "15",
        "alternativa_c": "18",
        "alternativa_d": "20",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f97",
        "enunciado": "Quanto é 80 + 20?",
        "alternativa_a": "90",
        "alternativa_b": "100",
        "alternativa_c": "110",
        "alternativa_d": "120",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f98",
        "enunciado": "Quanto é 13 × 3?",
        "alternativa_a": "36",
        "alternativa_b": "39",
        "alternativa_c": "42",
        "alternativa_d": "45",
        "resposta_correta": "b",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f99",
        "enunciado": "Quanto é 250 - 150?",
        "alternativa_a": "80",
        "alternativa_b": "90",
        "alternativa_c": "100",
        "alternativa_d": "110",
        "resposta_correta": "c",
        "nivel": "facil"
      },
      {
        "id_pergunta": "f100",
        "enunciado": "Quanto é 40 ÷ 8?",
        "alternativa_a": "4",
        "alternativa_b": "5",
        "alternativa_c": "6",
        "alternativa_d": "7",
        "resposta_correta": "b",
        "nivel": "facil"
      }
    ],
    medio: [
      {
        "id_pergunta": "m1",
        "enunciado": "Quanto é 2/3 + 1/4?",
        "alternativa_a": "11/12",
        "alternativa_b": "3/7",
        "alternativa_c": "5/12",
        "alternativa_d": "7/12",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m2",
        "enunciado": "Qual é a área de um retângulo de 8cm por 5cm?",
        "alternativa_a": "40 cm²",
        "alternativa_b": "26 cm²",
        "alternativa_c": "13 cm²",
        "alternativa_d": "35 cm²",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m3",
        "enunciado": "Se 3x = 15, quanto vale x?",
        "alternativa_a": "3",
        "alternativa_b": "5",
        "alternativa_c": "4",
        "alternativa_d": "6",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m4",
        "enunciado": "Quanto é 0,25 × 8?",
        "alternativa_a": "2",
        "alternativa_b": "2,5",
        "alternativa_c": "1,5",
        "alternativa_d": "3",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m5",
        "enunciado": "Qual é o perímetro de um quadrado com lado 6cm?",
        "alternativa_a": "36 cm",
        "alternativa_b": "12 cm",
        "alternativa_c": "24 cm",
        "alternativa_d": "18 cm",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m6",
        "enunciado": "Quanto é 1/2 × 3/5?",
        "alternativa_a": "3/10",
        "alternativa_b": "1/5",
        "alternativa_c": "4/7",
        "alternativa_d": "5/6",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m7",
        "enunciado": "Qual é o valor de 2^4?",
        "alternativa_a": "8",
        "alternativa_b": "16",
        "alternativa_c": "12",
        "alternativa_d": "32",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m8",
        "enunciado": "Se x - 7 = 12, qual é o valor de x?",
        "alternativa_a": "5",
        "alternativa_b": "19",
        "alternativa_c": "15",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m9",
        "enunciado": "Qual a raiz quadrada de 144?",
        "alternativa_a": "10",
        "alternativa_b": "12",
        "alternativa_c": "11",
        "alternativa_d": "14",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m10",
        "enunciado": "Quanto é 50% de 200?",
        "alternativa_a": "50",
        "alternativa_b": "100",
        "alternativa_c": "150",
        "alternativa_d": "25",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m11",
        "enunciado": "Calcule 1/2 + 1/3",
        "alternativa_a": "2/5",
        "alternativa_b": "5/6",
        "alternativa_c": "1/6",
        "alternativa_d": "2/3",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m12",
        "enunciado": "Se a temperatura é de 10°C e cai 15°C, qual a nova temperatura?",
        "alternativa_a": "-5°C",
        "alternativa_b": "-25°C",
        "alternativa_c": "-10°C",
        "alternativa_d": "-15°C",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m13",
        "enunciado": "Se 20% de um número é 40, qual é o número?",
        "alternativa_a": "80",
        "alternativa_b": "100",
        "alternativa_c": "200",
        "alternativa_d": "20",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m14",
        "enunciado": "Quanto é 1.5 × 10^3?",
        "alternativa_a": "150",
        "alternativa_b": "1500",
        "alternativa_c": "15000",
        "alternativa_d": "15",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m15",
        "enunciado": "Se 5 caixas pesam 100 kg, quanto pesam 3 caixas?",
        "alternativa_a": "60 kg",
        "alternativa_b": "50 kg",
        "alternativa_c": "75 kg",
        "alternativa_d": "30 kg",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m16",
        "enunciado": "Qual a área de um círculo com raio de 2cm?",
        "alternativa_a": "2π cm²",
        "alternativa_b": "4π cm²",
        "alternativa_c": "8π cm²",
        "alternativa_d": "6π cm²",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m17",
        "enunciado": "Se x/4 = 8, qual é o valor de x?",
        "alternativa_a": "2",
        "alternativa_b": "16",
        "alternativa_c": "32",
        "alternativa_d": "4",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m18",
        "enunciado": "Quanto é (-5) × 4?",
        "alternativa_a": "20",
        "alternativa_b": "-20",
        "alternativa_c": "1",
        "alternativa_d": "-1",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m19",
        "enunciado": "Qual é a área de um triângulo com base 6cm e altura 4cm?",
        "alternativa_a": "10 cm²",
        "alternativa_b": "12 cm²",
        "alternativa_c": "24 cm²",
        "alternativa_d": "18 cm²",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m20",
        "enunciado": "Calcule 3^3 + 2^2",
        "alternativa_a": "27",
        "alternativa_b": "31",
        "alternativa_c": "15",
        "alternativa_d": "36",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m21",
        "enunciado": "Se um carro viaja a 60 km/h, quanto tempo leva para percorrer 180 km?",
        "alternativa_a": "2 horas",
        "alternativa_b": "3 horas",
        "alternativa_c": "4 horas",
        "alternativa_d": "1 hora",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m22",
        "enunciado": "Simplifique a fração 18/24",
        "alternativa_a": "3/4",
        "alternativa_b": "9/12",
        "alternativa_c": "2/3",
        "alternativa_d": "1/2",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m23",
        "enunciado": "Se um relógio custa R$ 80 e está com 25% de desconto, qual o novo preço?",
        "alternativa_a": "R$ 60",
        "alternativa_b": "R$ 55",
        "alternativa_c": "R$ 70",
        "alternativa_d": "R$ 40",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m24",
        "enunciado": "Qual é a média dos números 10, 20 e 30?",
        "alternativa_a": "20",
        "alternativa_b": "25",
        "alternativa_c": "15",
        "alternativa_d": "60",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m25",
        "enunciado": "Se a soma de dois números é 50 e a diferença é 10, quais são os números?",
        "alternativa_a": "20 e 30",
        "alternativa_b": "25 e 25",
        "alternativa_c": "15 e 35",
        "alternativa_d": "10 e 40",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m26",
        "enunciado": "Quanto é 0.5 ÷ 0.1?",
        "alternativa_a": "0.5",
        "alternativa_b": "5",
        "alternativa_c": "0.05",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m27",
        "enunciado": "Qual o valor de 5 × (2+3)?",
        "alternativa_a": "13",
        "alternativa_b": "25",
        "alternativa_c": "15",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m28",
        "enunciado": "Quanto é 15% de 200?",
        "alternativa_a": "15",
        "alternativa_b": "30",
        "alternativa_c": "45",
        "alternativa_d": "20",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m29",
        "enunciado": "Se a área de um quadrado é 49 cm², qual é o seu lado?",
        "alternativa_a": "6 cm",
        "alternativa_b": "7 cm",
        "alternativa_c": "8 cm",
        "alternativa_d": "9 cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m30",
        "enunciado": "Qual a fração equivalente a 0.75?",
        "alternativa_a": "1/4",
        "alternativa_b": "3/4",
        "alternativa_c": "1/2",
        "alternativa_d": "4/5",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m31",
        "enunciado": "Se um trem viaja a 80 km/h, qual a distância que ele percorre em 2.5 horas?",
        "alternativa_a": "160 km",
        "alternativa_b": "200 km",
        "alternativa_c": "250 km",
        "alternativa_d": "180 km",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m32",
        "enunciado": "Qual o valor de √81?",
        "alternativa_a": "7",
        "alternativa_b": "8",
        "alternativa_c": "9",
        "alternativa_d": "10",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m33",
        "enunciado": "Calcule 10 - 3 × 2",
        "alternativa_a": "14",
        "alternativa_b": "7",
        "alternativa_c": "4",
        "alternativa_d": "20",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m34",
        "enunciado": "Se 5x + 5 = 20, qual é o valor de x?",
        "alternativa_a": "3",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "2",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m35",
        "enunciado": "Qual o volume de um cubo com 3 cm de aresta?",
        "alternativa_a": "9 cm³",
        "alternativa_b": "18 cm³",
        "alternativa_c": "27 cm³",
        "alternativa_d": "36 cm³",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m36",
        "enunciado": "Quanto é 2/5 de 50?",
        "alternativa_a": "10",
        "alternativa_b": "20",
        "alternativa_c": "25",
        "alternativa_d": "50",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m37",
        "enunciado": "Qual é o valor de 12 - (5 - 2)?",
        "alternativa_a": "5",
        "alternativa_b": "9",
        "alternativa_c": "15",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m38",
        "enunciado": "Se um número somado a 10 é igual a 30, qual é o número?",
        "alternativa_a": "10",
        "alternativa_b": "15",
        "alternativa_c": "20",
        "alternativa_d": "40",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m39",
        "enunciado": "Qual o perímetro de um triângulo equilátero com lado de 5cm?",
        "alternativa_a": "10 cm",
        "alternativa_b": "15 cm",
        "alternativa_c": "20 cm",
        "alternativa_d": "25 cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m40",
        "enunciado": "Calcule 10^2 ÷ 5^2",
        "alternativa_a": "2",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m41",
        "enunciado": "Se um objeto custa R$ 120 e é vendido por R$ 180, qual o percentual de lucro?",
        "alternativa_a": "30%",
        "alternativa_b": "40%",
        "alternativa_c": "50%",
        "alternativa_d": "60%",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m42",
        "enunciado": "Qual o valor de (2+4) × 3 - 5?",
        "alternativa_a": "13",
        "alternativa_b": "15",
        "alternativa_c": "12",
        "alternativa_d": "18",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m43",
        "enunciado": "Se 3x + 2 = 11, quanto vale x?",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "4",
        "alternativa_d": "5",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m44",
        "enunciado": "Qual é o dobro de 0.4?",
        "alternativa_a": "0.8",
        "alternativa_b": "0.2",
        "alternativa_c": "4",
        "alternativa_d": "8",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m45",
        "enunciado": "Qual o volume de um paralelepípedo com 2cm de largura, 3cm de comprimento e 4cm de altura?",
        "alternativa_a": "9 cm³",
        "alternativa_b": "12 cm³",
        "alternativa_c": "24 cm³",
        "alternativa_d": "18 cm³",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m46",
        "enunciado": "Quanto é 1/3 de 120?",
        "alternativa_a": "30",
        "alternativa_b": "40",
        "alternativa_c": "60",
        "alternativa_d": "80",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m47",
        "enunciado": "Quanto é 1/2 ÷ 1/4?",
        "alternativa_a": "1/8",
        "alternativa_b": "1/2",
        "alternativa_c": "2",
        "alternativa_d": "4",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m48",
        "enunciado": "Qual a raiz cúbica de 27?",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "9",
        "alternativa_d": "6",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m49",
        "enunciado": "Se a área de um círculo é 16π cm², qual é o seu raio?",
        "alternativa_a": "2 cm",
        "alternativa_b": "4 cm",
        "alternativa_c": "8 cm",
        "alternativa_d": "16 cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m50",
        "enunciado": "Calcule 5^2 - 3^2",
        "alternativa_a": "16",
        "alternativa_b": "4",
        "alternativa_c": "10",
        "alternativa_d": "15",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m51",
        "enunciado": "Se o preço de um item aumenta 10% e o novo preço é R$ 110, qual era o preço original?",
        "alternativa_a": "R$ 90",
        "alternativa_b": "R$ 100",
        "alternativa_c": "R$ 99",
        "alternativa_d": "R$ 120",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m52",
        "enunciado": "Qual a média dos números 5, 8, 11 e 16?",
        "alternativa_a": "9",
        "alternativa_b": "10",
        "alternativa_c": "12",
        "alternativa_d": "11",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m53",
        "enunciado": "Se 2x + 7 = 15, qual é o valor de x?",
        "alternativa_a": "4",
        "alternativa_b": "5",
        "alternativa_c": "6",
        "alternativa_d": "8",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m54",
        "enunciado": "Calcule 1.25 × 4",
        "alternativa_a": "4",
        "alternativa_b": "5",
        "alternativa_c": "4.5",
        "alternativa_d": "5.25",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m55",
        "enunciado": "Se a base de um triângulo é 10cm e a área é 20 cm², qual é a altura?",
        "alternativa_a": "2 cm",
        "alternativa_b": "4 cm",
        "alternativa_c": "6 cm",
        "alternativa_d": "8 cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m56",
        "enunciado": "Quanto é 75% de 80?",
        "alternativa_a": "50",
        "alternativa_b": "60",
        "alternativa_c": "70",
        "alternativa_d": "40",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m57",
        "enunciado": "Qual o valor de 20 - (5 × 2) - 3?",
        "alternativa_a": "10",
        "alternativa_b": "7",
        "alternativa_c": "15",
        "alternativa_d": "12",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m58",
        "enunciado": "Qual a raiz quadrada de 225?",
        "alternativa_a": "12",
        "alternativa_b": "13",
        "alternativa_c": "14",
        "alternativa_d": "15",
        "resposta_correta": "d",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m59",
        "enunciado": "Se 4x - 8 = 12, qual o valor de x?",
        "alternativa_a": "3",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "6",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m60",
        "enunciado": "Qual o perímetro de um retângulo com lados 7cm e 3cm?",
        "alternativa_a": "21 cm",
        "alternativa_b": "10 cm",
        "alternativa_c": "20 cm",
        "alternativa_d": "14 cm",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m61",
        "enunciado": "Quanto é 1/5 × 1/2?",
        "alternativa_a": "1/10",
        "alternativa_b": "2/5",
        "alternativa_c": "1/7",
        "alternativa_d": "3/10",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m62",
        "enunciado": "Se um ângulo em um triângulo retângulo é 30°, qual é o outro ângulo agudo?",
        "alternativa_a": "45°",
        "alternativa_b": "60°",
        "alternativa_c": "90°",
        "alternativa_d": "150°",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m63",
        "enunciado": "Se um número dividido por 5 é 15, qual é o número?",
        "alternativa_a": "3",
        "alternativa_b": "75",
        "alternativa_c": "20",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m64",
        "enunciado": "Calcule 8.25 - 3.75",
        "alternativa_a": "4.5",
        "alternativa_b": "5.5",
        "alternativa_c": "4.25",
        "alternativa_d": "5.25",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m65",
        "enunciado": "Qual a área de um trapézio com bases de 5cm e 7cm e altura de 4cm?",
        "alternativa_a": "12 cm²",
        "alternativa_b": "24 cm²",
        "alternativa_c": "28 cm²",
        "alternativa_d": "14 cm²",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m66",
        "enunciado": "Quanto é 25% de 200?",
        "alternativa_a": "25",
        "alternativa_b": "40",
        "alternativa_c": "50",
        "alternativa_d": "75",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m67",
        "enunciado": "Qual a área de um triângulo com base 8cm e altura 5cm?",
        "alternativa_a": "20 cm²",
        "alternativa_b": "24 cm²",
        "alternativa_c": "30 cm²",
        "alternativa_d": "40 cm²",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m68",
        "enunciado": "Quanto é 100 ÷ (-20)?",
        "alternativa_a": "-5",
        "alternativa_b": "5",
        "alternativa_c": "-2",
        "alternativa_d": "2",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m69",
        "enunciado": "Se x/3 + 2 = 5, qual o valor de x?",
        "alternativa_a": "3",
        "alternativa_b": "9",
        "alternativa_c": "6",
        "alternativa_d": "15",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m70",
        "enunciado": "Qual o valor de 3^2 - 1^2?",
        "alternativa_a": "8",
        "alternativa_b": "4",
        "alternativa_c": "6",
        "alternativa_d": "10",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m71",
        "enunciado": "Qual é o valor de 20% de 500?",
        "alternativa_a": "10",
        "alternativa_b": "50",
        "alternativa_c": "100",
        "alternativa_d": "200",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m72",
        "enunciado": "Calcule 0.1 × 0.2",
        "alternativa_a": "0.02",
        "alternativa_b": "0.2",
        "alternativa_c": "0.22",
        "alternativa_d": "0.01",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m73",
        "enunciado": "Se a área de um quadrado é 100 cm², qual é o seu perímetro?",
        "alternativa_a": "20 cm",
        "alternativa_b": "40 cm",
        "alternativa_c": "10 cm",
        "alternativa_d": "50 cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m74",
        "enunciado": "Qual o valor de 2^5?",
        "alternativa_a": "10",
        "alternativa_b": "16",
        "alternativa_c": "32",
        "alternativa_d": "25",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m75",
        "enunciado": "Se 2x - 5 = 15, quanto vale x?",
        "alternativa_a": "5",
        "alternativa_b": "10",
        "alternativa_c": "15",
        "alternativa_d": "20",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m76",
        "enunciado": "Quanto é a soma de 1/3 e 1/6?",
        "alternativa_a": "1/2",
        "alternativa_b": "2/9",
        "alternativa_c": "1/3",
        "alternativa_d": "3/6",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m77",
        "enunciado": "Qual o perímetro de um círculo com raio de 3cm?",
        "alternativa_a": "3π cm",
        "alternativa_b": "6π cm",
        "alternativa_c": "9π cm",
        "alternativa_d": "12π cm",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m78",
        "enunciado": "Calcule (1/2) × (1/3) ÷ (1/4)",
        "alternativa_a": "2/3",
        "alternativa_b": "1/6",
        "alternativa_c": "1/2",
        "alternativa_d": "3/4",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m79",
        "enunciado": "Se 50% de um número é 25, qual é o número?",
        "alternativa_a": "12.5",
        "alternativa_b": "50",
        "alternativa_c": "75",
        "alternativa_d": "100",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m80",
        "enunciado": "Qual é a média de -5, 0 e 5?",
        "alternativa_a": "0",
        "alternativa_b": "5",
        "alternativa_c": "-5",
        "alternativa_d": "10",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m81",
        "enunciado": "Qual a área de um losango com diagonais de 6cm e 8cm?",
        "alternativa_a": "24 cm²",
        "alternativa_b": "48 cm²",
        "alternativa_c": "14 cm²",
        "alternativa_d": "28 cm²",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m82",
        "enunciado": "Se 3x = 2x + 10, qual o valor de x?",
        "alternativa_a": "5",
        "alternativa_b": "10",
        "alternativa_c": "2",
        "alternativa_d": "20",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m83",
        "enunciado": "Quanto é 2/3 de 150?",
        "alternativa_a": "50",
        "alternativa_b": "75",
        "alternativa_c": "100",
        "alternativa_d": "120",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m84",
        "enunciado": "Se um número ao quadrado é 64, qual é o número?",
        "alternativa_a": "6",
        "alternativa_b": "8",
        "alternativa_c": "16",
        "alternativa_d": "32",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m85",
        "enunciado": "Calcule 100 ÷ 4 + 10",
        "alternativa_a": "15",
        "alternativa_b": "20",
        "alternativa_c": "35",
        "alternativa_d": "50",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m86",
        "enunciado": "Se um ângulo é 45°, qual é o seu complemento?",
        "alternativa_a": "45°",
        "alternativa_b": "135°",
        "alternativa_c": "90°",
        "alternativa_d": "180°",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m87",
        "enunciado": "Qual a área de um círculo com diâmetro de 10cm?",
        "alternativa_a": "100π cm²",
        "alternativa_b": "25π cm²",
        "alternativa_c": "10π cm²",
        "alternativa_d": "5π cm²",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m88",
        "enunciado": "Quanto é (-10) + (-5)?",
        "alternativa_a": "5",
        "alternativa_b": "-5",
        "alternativa_c": "15",
        "alternativa_d": "-15",
        "resposta_correta": "d",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m89",
        "enunciado": "Simplifique a expressão 2(x+3)",
        "alternativa_a": "2x+3",
        "alternativa_b": "2x+6",
        "alternativa_c": "x+6",
        "alternativa_d": "5x",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m90",
        "enunciado": "Se um número é 20% maior que 100, qual é o número?",
        "alternativa_a": "110",
        "alternativa_b": "120",
        "alternativa_c": "102",
        "alternativa_d": "125",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m91",
        "enunciado": "Qual o valor de 2^3 × 3^2?",
        "alternativa_a": "72",
        "alternativa_b": "36",
        "alternativa_c": "54",
        "alternativa_d": "48",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m92",
        "enunciado": "Se um carro viaja a uma velocidade de 90 km/h, qual a distância que ele percorre em 30 minutos?",
        "alternativa_a": "30 km",
        "alternativa_b": "45 km",
        "alternativa_c": "60 km",
        "alternativa_d": "90 km",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m93",
        "enunciado": "Quanto é 3/4 - 1/2?",
        "alternativa_a": "1/4",
        "alternativa_b": "1/2",
        "alternativa_c": "1/8",
        "alternativa_d": "1/6",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m94",
        "enunciado": "Se um livro custa R$ 50 e é vendido com 10% de lucro, qual o preço de venda?",
        "alternativa_a": "R$ 55",
        "alternativa_b": "R$ 60",
        "alternativa_c": "R$ 52.50",
        "alternativa_d": "R$ 45",
        "resposta_correta": "a",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m95",
        "enunciado": "Qual a raiz quadrada de 400?",
        "alternativa_a": "10",
        "alternativa_b": "20",
        "alternativa_c": "30",
        "alternativa_d": "40",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m96",
        "enunciado": "Calcule 15 - 5 × 2 + 1",
        "alternativa_a": "21",
        "alternativa_b": "6",
        "alternativa_c": "11",
        "alternativa_d": "26",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m97",
        "enunciado": "Se 3(x-1) = 9, qual é o valor de x?",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "4",
        "alternativa_d": "5",
        "resposta_correta": "c",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m98",
        "enunciado": "Quanto é 12.5% de 80?",
        "alternativa_a": "8",
        "alternativa_b": "10",
        "alternativa_c": "12",
        "alternativa_d": "15",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m99",
        "enunciado": "Qual a área de um paralelogramo com base 10cm e altura 6cm?",
        "alternativa_a": "30 cm²",
        "alternativa_b": "60 cm²",
        "alternativa_c": "16 cm²",
        "alternativa_d": "26 cm²",
        "resposta_correta": "b",
        "nivel": "medio"
      },
      {
        "id_pergunta": "m100",
        "enunciado": "Se a soma de dois ângulos é 90° e um deles é 30°, qual é o outro?",
        "alternativa_a": "45°",
        "alternativa_b": "50°",
        "alternativa_c": "60°",
        "alternativa_d": "120°",
        "resposta_correta": "c",
        "nivel": "medio"
      }
    ],
    dificil: [
      {
        "id_pergunta": "d1",
        "enunciado": "Resolva a equação quadrática: x² - 5x + 6 = 0.",
        "alternativa_a": "x = 2 ou x = 3",
        "alternativa_b": "x = 1 ou x = 6",
        "alternativa_c": "x = -2 ou x = -3",
        "alternativa_d": "x = 0 ou x = 5",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d2",
        "enunciado": "Qual é o volume de um cubo com aresta de 4 cm?",
        "alternativa_a": "16 cm³",
        "alternativa_b": "48 cm³",
        "alternativa_c": "64 cm³",
        "alternativa_d": "32 cm³",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d3",
        "enunciado": "Se log₂(x) = 3, quanto vale x?",
        "alternativa_a": "6",
        "alternativa_b": "9",
        "alternativa_c": "8",
        "alternativa_d": "12",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d4",
        "enunciado": "Quanto é sin(30°)?",
        "alternativa_a": "1/2",
        "alternativa_b": "√3/2",
        "alternativa_c": "√2/2",
        "alternativa_d": "1",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d5",
        "enunciado": "Resolva o sistema de equações: 2x + y = 7 e x - y = 2.",
        "alternativa_a": "x = 3, y = 1",
        "alternativa_b": "x = 2, y = 3",
        "alternativa_c": "x = 4, y = -1",
        "alternativa_d": "x = 1, y = 5",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d6",
        "enunciado": "Se f(x) = 2x² + 3, qual é o valor de f(2)?",
        "alternativa_a": "11",
        "alternativa_b": "7",
        "alternativa_c": "14",
        "alternativa_d": "10",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d7",
        "enunciado": "Qual é a área de um círculo com raio de 5 cm?",
        "alternativa_a": "10π cm²",
        "alternativa_b": "25π cm²",
        "alternativa_c": "5π cm²",
        "alternativa_d": "50π cm²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d8",
        "enunciado": "Quanto é o limite de x² quando x se aproxima de 3?",
        "alternativa_a": "6",
        "alternativa_b": "9",
        "alternativa_c": "3",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d9",
        "enunciado": "Qual a derivada de f(x) = 3x²?",
        "alternativa_a": "3x",
        "alternativa_b": "6x",
        "alternativa_c": "x³",
        "alternativa_d": "2x",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d10",
        "enunciado": "Resolva para x: 2/x = 5",
        "alternativa_a": "10",
        "alternativa_b": "2.5",
        "alternativa_c": "0.4",
        "alternativa_d": "0.5",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d11",
        "enunciado": "Qual a integral de 2x?",
        "alternativa_a": "x² + C",
        "alternativa_b": "2",
        "alternativa_c": "2x² + C",
        "alternativa_d": "x + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d12",
        "enunciado": "Se tan(x) = 1, qual é o valor de x em graus?",
        "alternativa_a": "30°",
        "alternativa_b": "45°",
        "alternativa_c": "60°",
        "alternativa_d": "90°",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d13",
        "enunciado": "Qual o volume de uma esfera com raio de 3 cm?",
        "alternativa_a": "9π cm³",
        "alternativa_b": "18π cm³",
        "alternativa_c": "36π cm³",
        "alternativa_d": "27π cm³",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d14",
        "enunciado": "Resolva para x: e^x = 7.389",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "3",
        "alternativa_d": "4",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d15",
        "enunciado": "Se cos(x) = 0, qual o valor de x em radianos?",
        "alternativa_a": "π/4",
        "alternativa_b": "π/2",
        "alternativa_c": "π",
        "alternativa_d": "2π",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d16",
        "enunciado": "Qual o logaritmo de 1000 na base 10?",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "4",
        "alternativa_d": "100",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d17",
        "enunciado": "Se f(x) = 1/x, qual a derivada de f(x)?",
        "alternativa_a": "x²",
        "alternativa_b": "-1/x²",
        "alternativa_c": "1",
        "alternativa_d": "-x",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d18",
        "enunciado": "Calcule a integral definida de 1 a 2 de 2x dx.",
        "alternativa_a": "3",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "1",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d19",
        "enunciado": "Se a hipotenusa de um triângulo retângulo é 5 e um dos catetos é 3, qual é o outro cateto?",
        "alternativa_a": "2",
        "alternativa_b": "4",
        "alternativa_c": "6",
        "alternativa_d": "8",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d20",
        "enunciado": "Se ln(x) = 1, qual é o valor de x?",
        "alternativa_a": "1",
        "alternativa_b": "e",
        "alternativa_c": "10",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d21",
        "enunciado": "Resolva para x: x/3 + 2 = 5",
        "alternativa_a": "3",
        "alternativa_b": "6",
        "alternativa_c": "9",
        "alternativa_d": "15",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d22",
        "enunciado": "Qual a derivada de f(x) = sin(x)?",
        "alternativa_a": "cos(x)",
        "alternativa_b": "-cos(x)",
        "alternativa_c": "-sin(x)",
        "alternativa_d": "tan(x)",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d23",
        "enunciado": "Se 3/5 = x/10, qual o valor de x?",
        "alternativa_a": "6",
        "alternativa_b": "5",
        "alternativa_c": "4",
        "alternativa_d": "3",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d24",
        "enunciado": "Qual a área de um triângulo com base 8 cm e altura 6 cm?",
        "alternativa_a": "14 cm²",
        "alternativa_b": "24 cm²",
        "alternativa_c": "32 cm²",
        "alternativa_d": "48 cm²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d25",
        "enunciado": "Resolva para x: √(x+4) = 3",
        "alternativa_a": "5",
        "alternativa_b": "9",
        "alternativa_c": "7",
        "alternativa_d": "1",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d26",
        "enunciado": "Qual o resultado de (-2)³?",
        "alternativa_a": "-8",
        "alternativa_b": "8",
        "alternativa_c": "-6",
        "alternativa_d": "6",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d27",
        "enunciado": "Se a diagonal de um quadrado é 4√2 cm, qual é a área do quadrado?",
        "alternativa_a": "8 cm²",
        "alternativa_b": "16 cm²",
        "alternativa_c": "32 cm²",
        "alternativa_d": "64 cm²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d28",
        "enunciado": "Qual a integral de 3x²?",
        "alternativa_a": "x³ + C",
        "alternativa_b": "6x + C",
        "alternativa_c": "3x³ + C",
        "alternativa_d": "x² + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d29",
        "enunciado": "Se log₁₀(x) = -2, qual o valor de x?",
        "alternativa_a": "100",
        "alternativa_b": "0.01",
        "alternativa_c": "-100",
        "alternativa_d": "0.1",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d30",
        "enunciado": "Qual o volume de um cilindro com raio 2 cm e altura 5 cm?",
        "alternativa_a": "10π cm³",
        "alternativa_b": "20π cm³",
        "alternativa_c": "25π cm³",
        "alternativa_d": "40π cm³",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d31",
        "enunciado": "Resolva a inequação: 2x + 1 > 5",
        "alternativa_a": "x > 2",
        "alternativa_b": "x < 2",
        "alternativa_c": "x > 3",
        "alternativa_d": "x < 3",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d32",
        "enunciado": "Qual a derivada de f(x) = e^x?",
        "alternativa_a": "e^x",
        "alternativa_b": "e^(x+1)",
        "alternativa_c": "x e^x",
        "alternativa_d": "e^(x-1)",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d33",
        "enunciado": "Calcule a integral de 1/x dx.",
        "alternativa_a": "ln|x| + C",
        "alternativa_b": "x + C",
        "alternativa_c": "x²/2 + C",
        "alternativa_d": "1 + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d34",
        "enunciado": "Se a área de um triângulo equilátero é 16√3 cm², qual é o lado do triângulo?",
        "alternativa_a": "4 cm",
        "alternativa_b": "6 cm",
        "alternativa_c": "8 cm",
        "alternativa_d": "10 cm",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d35",
        "enunciado": "Resolva para x: |x - 2| = 5",
        "alternativa_a": "x = 7 ou x = -3",
        "alternativa_b": "x = 3 ou x = -7",
        "alternativa_c": "x = 7",
        "alternativa_d": "x = -3",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d36",
        "enunciado": "Se a soma dos termos de uma P.A. é 105, com 7 termos e primeiro termo 5, qual o último termo?",
        "alternativa_a": "15",
        "alternativa_b": "20",
        "alternativa_c": "25",
        "alternativa_d": "30",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d37",
        "enunciado": "Qual o valor de sin(60°)?",
        "alternativa_a": "1/2",
        "alternativa_b": "√3/2",
        "alternativa_c": "√2/2",
        "alternativa_d": "1",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d38",
        "enunciado": "Calcule a derivada de f(x) = ln(x)",
        "alternativa_a": "x",
        "alternativa_b": "1/x",
        "alternativa_c": "e^x",
        "alternativa_d": "xln(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d39",
        "enunciado": "Qual o volume de um cone com raio 3 cm e altura 4 cm?",
        "alternativa_a": "9π cm³",
        "alternativa_b": "12π cm³",
        "alternativa_c": "16π cm³",
        "alternativa_d": "36π cm³",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d40",
        "enunciado": "Resolva a equação: 3^x = 81",
        "alternativa_a": "3",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "9",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d41",
        "enunciado": "Qual o valor de 2log₅(5)?",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "5",
        "alternativa_d": "10",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d42",
        "enunciado": "Qual a integral de cos(x) dx?",
        "alternativa_a": "sin(x) + C",
        "alternativa_b": "-sin(x) + C",
        "alternativa_c": "cos(x) + C",
        "alternativa_d": "-cos(x) + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d43",
        "enunciado": "Se a área de um círculo é 49π cm², qual o seu raio?",
        "alternativa_a": "5 cm",
        "alternativa_b": "6 cm",
        "alternativa_c": "7 cm",
        "alternativa_d": "8 cm",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d44",
        "enunciado": "Resolva para x: √(2x+1) = 5",
        "alternativa_a": "2",
        "alternativa_b": "10",
        "alternativa_c": "12",
        "alternativa_d": "15",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d45",
        "enunciado": "Qual o valor de cos(45°)?",
        "alternativa_a": "1/2",
        "alternativa_b": "√3/2",
        "alternativa_c": "√2/2",
        "alternativa_d": "1",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d46",
        "enunciado": "Qual a derivada de f(x) = tan(x)?",
        "alternativa_a": "-sec²(x)",
        "alternativa_b": "sec²(x)",
        "alternativa_c": "cot²(x)",
        "alternativa_d": "-cot²(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d47",
        "enunciado": "Resolva o sistema: 3x - y = 8 e x + y = 4",
        "alternativa_a": "x = 3, y = 1",
        "alternativa_b": "x = 2, y = 2",
        "alternativa_c": "x = 4, y = 0",
        "alternativa_d": "x = 1, y = 3",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d48",
        "enunciado": "Qual a integral de e^x dx?",
        "alternativa_a": "e^x + C",
        "alternativa_b": "e^(x+1) + C",
        "alternativa_c": "x e^x + C",
        "alternativa_d": "ln(x) + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d49",
        "enunciado": "Calcule o limite de (x²-1)/(x-1) quando x se aproxima de 1.",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "0",
        "alternativa_d": "Indefinido",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d50",
        "enunciado": "Qual a área de um trapézio com bases 4 cm e 6 cm e altura 3 cm?",
        "alternativa_a": "12 cm²",
        "alternativa_b": "15 cm²",
        "alternativa_c": "18 cm²",
        "alternativa_d": "24 cm²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d51",
        "enunciado": "Se ln(x) = 2, quanto vale x?",
        "alternativa_a": "e²",
        "alternativa_b": "2e",
        "alternativa_c": "e/2",
        "alternativa_d": "√e",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d52",
        "enunciado": "Resolva a equação logarítmica: log₃(x) + log₃(4) = 2",
        "alternativa_a": "2.25",
        "alternativa_b": "1.5",
        "alternativa_c": "3",
        "alternativa_d": "4",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d53",
        "enunciado": "Qual o valor de cos(60°)?",
        "alternativa_a": "1/2",
        "alternativa_b": "√3/2",
        "alternativa_c": "√2/2",
        "alternativa_d": "1",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d54",
        "enunciado": "Se f(x) = x³, qual é a segunda derivada de f(x)?",
        "alternativa_a": "3x²",
        "alternativa_b": "6x",
        "alternativa_c": "3",
        "alternativa_d": "6",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d55",
        "enunciado": "Qual o volume de um cilindro com diâmetro 4 cm e altura 6 cm?",
        "alternativa_a": "24π cm³",
        "alternativa_b": "48π cm³",
        "alternativa_c": "36π cm³",
        "alternativa_d": "12π cm³",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d56",
        "enunciado": "Resolva para x: 2^(x-1) = 8",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "4",
        "alternativa_d": "5",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d57",
        "enunciado": "Qual a área de um losango com diagonais de 10 cm e 12 cm?",
        "alternativa_a": "30 cm²",
        "alternativa_b": "60 cm²",
        "alternativa_c": "120 cm²",
        "alternativa_d": "22 cm²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d58",
        "enunciado": "Calcule a integral de x² + 1 dx.",
        "alternativa_a": "2x + C",
        "alternativa_b": "x³/3 + x + C",
        "alternativa_c": "x³/3 + C",
        "alternativa_d": "x² + x + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d59",
        "enunciado": "Se a soma dos ângulos internos de um polígono regular é 1080°, quantos lados tem o polígono?",
        "alternativa_a": "6",
        "alternativa_b": "7",
        "alternativa_c": "8",
        "alternativa_d": "9",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d60",
        "enunciado": "Resolva para x: log₂(x-1) = 3",
        "alternativa_a": "7",
        "alternativa_b": "8",
        "alternativa_c": "9",
        "alternativa_d": "10",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d61",
        "enunciado": "Qual a derivada de f(x) = ln(x²)?",
        "alternativa_a": "1/x²",
        "alternativa_b": "2/x",
        "alternativa_c": "2x",
        "alternativa_d": "2ln(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d62",
        "enunciado": "Calcule o limite de sin(x)/x quando x se aproxima de 0.",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "Indefinido",
        "alternativa_d": "π",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d63",
        "enunciado": "Se a área de um cone é 24π cm² e o raio da base é 3 cm, qual a altura?",
        "alternativa_a": "2 cm",
        "alternativa_b": "3 cm",
        "alternativa_c": "4 cm",
        "alternativa_d": "5 cm",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d64",
        "enunciado": "Qual o valor de 2sin(π/6) + cos(π/3)?",
        "alternativa_a": "1",
        "alternativa_b": "1.5",
        "alternativa_c": "√3",
        "alternativa_d": "2",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d65",
        "enunciado": "Se a área total de um cubo é 96 cm², qual é o volume?",
        "alternativa_a": "16 cm³",
        "alternativa_b": "32 cm³",
        "alternativa_c": "64 cm³",
        "alternativa_d": "8 cm³",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d66",
        "enunciado": "Qual a derivada de f(x) = x²sin(x)?",
        "alternativa_a": "2x cos(x)",
        "alternativa_b": "x²cos(x) + 2xsin(x)",
        "alternativa_c": "2x sin(x)",
        "alternativa_d": "x²cos(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d67",
        "enunciado": "Resolva para x: log₂(x) = log₂(5) + log₂(3)",
        "alternativa_a": "8",
        "alternativa_b": "15",
        "alternativa_c": "2",
        "alternativa_d": "5/3",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d68",
        "enunciado": "Calcule a integral de x cos(x) dx.",
        "alternativa_a": "x sin(x) - cos(x) + C",
        "alternativa_b": "x sin(x) + cos(x) + C",
        "alternativa_c": "sin(x) + C",
        "alternativa_d": "x sin(x) + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d69",
        "enunciado": "Se um triângulo tem lados 6, 8 e 10, qual é a sua área?",
        "alternativa_a": "12",
        "alternativa_b": "24",
        "alternativa_c": "30",
        "alternativa_d": "48",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d70",
        "enunciado": "Qual o limite de (x²+3x+2)/(x+2) quando x se aproxima de -2?",
        "alternativa_a": "1",
        "alternativa_b": "-1",
        "alternativa_c": "0",
        "alternativa_d": "Indefinido",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d71",
        "enunciado": "Resolva para x: √x + 2 = 5",
        "alternativa_a": "3",
        "alternativa_b": "9",
        "alternativa_c": "25",
        "alternativa_d": "1",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d72",
        "enunciado": "Qual a derivada de f(x) = cos(x)?",
        "alternativa_a": "sin(x)",
        "alternativa_b": "-sin(x)",
        "alternativa_c": "cos(x)",
        "alternativa_d": "-cos(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d73",
        "enunciado": "Se log₄(x) = 2, quanto vale x?",
        "alternativa_a": "8",
        "alternativa_b": "16",
        "alternativa_c": "2",
        "alternativa_d": "4",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d74",
        "enunciado": "Calcule a integral de sin(x) dx.",
        "alternativa_a": "cos(x) + C",
        "alternativa_b": "-cos(x) + C",
        "alternativa_c": "-sin(x) + C",
        "alternativa_d": "e^x + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d75",
        "enunciado": "Qual o volume de uma pirâmide com base quadrada de lado 3 cm e altura 5 cm?",
        "alternativa_a": "15 cm³",
        "alternativa_b": "20 cm³",
        "alternativa_c": "45 cm³",
        "alternativa_d": "30 cm³",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d76",
        "enunciado": "Resolva a equação: 5^(x+1) = 25^(x-1)",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "3",
        "alternativa_d": "4",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d77",
        "enunciado": "Qual a derivada de f(x) = x/(x+1)?",
        "alternativa_a": "1/(x+1)²",
        "alternativa_b": "x/(x+1)²",
        "alternativa_c": "1",
        "alternativa_d": "0",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d78",
        "enunciado": "Calcule a integral de 1/(2x+1) dx.",
        "alternativa_a": "ln|2x+1| + C",
        "alternativa_b": "½ln|2x+1| + C",
        "alternativa_c": "1/(2(2x+1)) + C",
        "alternativa_d": "2ln|2x+1| + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d79",
        "enunciado": "Se tan(x) = √3, qual o valor de x em graus?",
        "alternativa_a": "30°",
        "alternativa_b": "45°",
        "alternativa_c": "60°",
        "alternativa_d": "90°",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d80",
        "enunciado": "Qual o volume de um cone com raio 4 cm e altura 3 cm?",
        "alternativa_a": "12π cm³",
        "alternativa_b": "16π cm³",
        "alternativa_c": "48π cm³",
        "alternativa_d": "36π cm³",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d81",
        "enunciado": "Resolva a equação: ln(x+2) = 1",
        "alternativa_a": "e+2",
        "alternativa_b": "e-2",
        "alternativa_c": "e/2",
        "alternativa_d": "2e",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d82",
        "enunciado": "Qual a derivada de f(x) = sin(2x)?",
        "alternativa_a": "cos(2x)",
        "alternativa_b": "2cos(2x)",
        "alternativa_c": "-cos(2x)",
        "alternativa_d": "-sin(2x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d83",
        "enunciado": "Calcule a integral de 2x sin(x²) dx.",
        "alternativa_a": "-cos(x²) + C",
        "alternativa_b": "cos(x²) + C",
        "alternativa_c": "x²cos(x²) + C",
        "alternativa_d": "2x cos(x²) + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d84",
        "enunciado": "Se a área da superfície de uma esfera é 100π cm², qual é o seu raio?",
        "alternativa_a": "25 cm",
        "alternativa_b": "10 cm",
        "alternativa_c": "5 cm",
        "alternativa_d": "2 cm",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d85",
        "enunciado": "Resolva a inequação: x² - 4 > 0",
        "alternativa_a": "x > 2",
        "alternativa_b": "x < -2 ou x > 2",
        "alternativa_c": "-2 < x < 2",
        "alternativa_d": "x < -2",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d86",
        "enunciado": "Qual o valor de sin(π/2)?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "-1",
        "alternativa_d": "√2/2",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d87",
        "enunciado": "Se a soma dos termos de uma P.G. é 63, com 6 termos e razão 2, qual é o primeiro termo?",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "3",
        "alternativa_d": "4",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d88",
        "enunciado": "Qual a derivada de f(x) = ln(sin(x))?",
        "alternativa_a": "cos(x)/sin(x)",
        "alternativa_b": "cot(x)",
        "alternativa_c": "1/sin(x)",
        "alternativa_d": "-cos(x)/sin(x)",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d89",
        "enunciado": "Calcule a integral de 2x/(x²+1) dx.",
        "alternativa_a": "2ln|x²+1| + C",
        "alternativa_b": "ln|x²+1| + C",
        "alternativa_c": "x²ln|x²+1| + C",
        "alternativa_d": "x² + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d90",
        "enunciado": "Se a área da base de um cilindro é 9π cm² e o volume é 36π cm³, qual a altura?",
        "alternativa_a": "3 cm",
        "alternativa_b": "4 cm",
        "alternativa_c": "5 cm",
        "alternativa_d": "6 cm",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d91",
        "enunciado": "Resolva para x: 2x² + 7x + 3 = 0",
        "alternativa_a": "x = -1, x = -3/2",
        "alternativa_b": "x = 1, x = 3/2",
        "alternativa_c": "x = -1/2, x = -3",
        "alternativa_d": "x = 1/2, x = 3",
        "resposta_correta": "c",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d92",
        "enunciado": "Qual o valor de cos(120°)?",
        "alternativa_a": "1/2",
        "alternativa_b": "-1/2",
        "alternativa_c": "√3/2",
        "alternativa_d": "-√3/2",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d93",
        "enunciado": "Se a área de um retângulo é 48 cm² e o comprimento é 3 vezes a largura, quais são as dimensões?",
        "alternativa_a": "4 cm e 12 cm",
        "alternativa_b": "6 cm e 8 cm",
        "alternativa_c": "3 cm e 16 cm",
        "alternativa_d": "2 cm e 24 cm",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d94",
        "enunciado": "Qual a derivada de f(x) = (x² + 1)³?",
        "alternativa_a": "3(x²+1)²",
        "alternativa_b": "6x(x²+1)²",
        "alternativa_c": "2x(x²+1)²",
        "alternativa_d": "3x(x²+1)²",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d95",
        "enunciado": "Calcule a integral de x e^x dx.",
        "alternativa_a": "e^x + C",
        "alternativa_b": "x e^x - e^x + C",
        "alternativa_c": "x e^x + e^x + C",
        "alternativa_d": "x² e^x + C",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d96",
        "enunciado": "Qual o volume de um cilindro com raio 5 cm e altura 10 cm?",
        "alternativa_a": "50π cm³",
        "alternativa_b": "100π cm³",
        "alternativa_c": "150π cm³",
        "alternativa_d": "250π cm³",
        "resposta_correta": "d",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d97",
        "enunciado": "Resolva para x: 1/x + 1/2 = 1",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "0.5",
        "alternativa_d": "3",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d98",
        "enunciado": "Qual a derivada de f(x) = ln(x)/x?",
        "alternativa_a": "1/x²",
        "alternativa_b": "(1 - ln(x))/x²",
        "alternativa_c": "1/x",
        "alternativa_d": "ln(x) + 1",
        "resposta_correta": "b",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d99",
        "enunciado": "Calcule a integral de √x dx.",
        "alternativa_a": "⅔x^(3/2) + C",
        "alternativa_b": "½x^(1/2) + C",
        "alternativa_c": "x^(3/2) + C",
        "alternativa_d": "x^(1/2) + C",
        "resposta_correta": "a",
        "nivel": "dificil"
      },
      {
        "id_pergunta": "d100",
        "enunciado": "Se a área de um setor circular com raio 6 cm e ângulo 60° é?",
        "alternativa_a": "6π cm²",
        "alternativa_b": "12π cm²",
        "alternativa_c": "18π cm²",
        "alternativa_d": "36π cm²",
        "resposta_correta": "a",
        "nivel": "dificil"
      }
    ],
    expert: [
      {
        "id_pergunta": "e1",
        "enunciado": "Resolva a integral indefinida: ∫(2x + 1)dx",
        "alternativa_a": "x² + x + C",
        "alternativa_b": "2x² + x + C",
        "alternativa_c": "x² + 2x + C",
        "alternativa_d": "2x + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e2",
        "enunciado": "Qual é o limite de (x² - 1)/(x - 1) quando x → 1?",
        "alternativa_a": "2",
        "alternativa_b": "1",
        "alternativa_c": "0",
        "alternativa_d": "∞",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e3",
        "enunciado": "Resolva a equação cúbica: x³ - 6x² + 11x - 6 = 0",
        "alternativa_a": "x = 1, 2, 3",
        "alternativa_b": "x = 0, 2, 3",
        "alternativa_c": "x = 1, 2, 4",
        "alternativa_d": "x = 2, 3, 4",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e4",
        "enunciado": "Qual é a transformada de Laplace de f(t) = e^(2t)?",
        "alternativa_a": "1/(s-2)",
        "alternativa_b": "1/(s+2)",
        "alternativa_c": "2/(s-1)",
        "alternativa_d": "s/(s-2)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e5",
        "enunciado": "Resolva a equação diferencial: dy/dx = 2y",
        "alternativa_a": "y = Ce^(2x)",
        "alternativa_b": "y = C + 2x",
        "alternativa_c": "y = 2Ce^x",
        "alternativa_d": "y = Ce^x + 2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e6",
        "enunciado": "Calcule a derivada de f(x) = sin(x²)",
        "alternativa_a": "2x cos(x²)",
        "alternativa_b": "cos(x²)",
        "alternativa_c": "2x sin(x²)",
        "alternativa_d": "x cos(x²)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e7",
        "enunciado": "Qual é o valor da integral de linha ∫C xy dx, onde C é o quadrado de vértices (0,0), (1,0), (1,1) e (0,1)?",
        "alternativa_a": "0",
        "alternativa_b": "1/2",
        "alternativa_c": "-1/2",
        "alternativa_d": "1",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e8",
        "enunciado": "Se a matriz A é [[1, 2], [3, 4]], qual é o seu determinante?",
        "alternativa_a": "1",
        "alternativa_b": "-2",
        "alternativa_c": "2",
        "alternativa_d": "-1",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e9",
        "enunciado": "Resolva a equação diferencial: y' - 2y = 0",
        "alternativa_a": "y = C e^(2x)",
        "alternativa_b": "y = C e^(-2x)",
        "alternativa_c": "y = C e^x",
        "alternativa_d": "y = C e^(x/2)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e10",
        "enunciado": "Calcule a integral de e^x sin(x) dx",
        "alternativa_a": "e^x (sin x - cos x)/2 + C",
        "alternativa_b": "e^x (sin x + cos x)/2 + C",
        "alternativa_c": "e^x cos x + C",
        "alternativa_d": "e^x sin x + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e11",
        "enunciado": "Qual é a transformada de Fourier de uma função delta de Dirac δ(t)?",
        "alternativa_a": "1",
        "alternativa_b": "e^(-iωt)",
        "alternativa_c": "iω",
        "alternativa_d": "1/ω",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e12",
        "enunciado": "Se z = 3 + 4i, qual é o módulo de z?",
        "alternativa_a": "3",
        "alternativa_b": "4",
        "alternativa_c": "5",
        "alternativa_d": "7",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e13",
        "enunciado": "Calcule a derivada de f(x) = x^x",
        "alternativa_a": "x^x(1 + ln x)",
        "alternativa_b": "x^x ln x",
        "alternativa_c": "x^(x-1)",
        "alternativa_d": "x^x / x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e14",
        "enunciado": "Qual é a solução da equação diferencial y'' + y = 0?",
        "alternativa_a": "y = C₁ cos x + C₂ sin x",
        "alternativa_b": "y = C₁ e^x + C₂ e^(-x)",
        "alternativa_c": "y = C₁ x + C₂",
        "alternativa_d": "y = C₁ e^x cos x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e15",
        "enunciado": "Se a matriz A é [[2, 1], [4, 2]], qual é o seu autovalor?",
        "alternativa_a": "0 e 4",
        "alternativa_b": "2 e 2",
        "alternativa_c": "1 e 4",
        "alternativa_d": "0 e 2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e16",
        "enunciado": "Qual o valor da integral ∫₀^∞ x e^(-x²) dx?",
        "alternativa_a": "1/2",
        "alternativa_b": "1",
        "alternativa_c": "0",
        "alternativa_d": "2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e17",
        "enunciado": "Se f(x) = √x, qual é a derivada de f(x)?",
        "alternativa_a": "1/(2√x)",
        "alternativa_b": "2√x",
        "alternativa_c": "√x/2",
        "alternativa_d": "1/x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e18",
        "enunciado": "Resolva a equação diferencial: y' + 2y = 4",
        "alternativa_a": "y = C e^(-2x) + 2",
        "alternativa_b": "y = C e^(2x) + 2",
        "alternativa_c": "y = C e^(-2x) + 4",
        "alternativa_d": "y = C e^(2x) + 4",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e19",
        "enunciado": "Qual o valor de i¹⁰?",
        "alternativa_a": "1",
        "alternativa_b": "-1",
        "alternativa_c": "i",
        "alternativa_d": "-i",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e20",
        "enunciado": "Calcule a integral de 1/(x ln x) dx",
        "alternativa_a": "ln |x| + C",
        "alternativa_b": "ln |ln x| + C",
        "alternativa_c": "1/x² + C",
        "alternativa_d": "ln x + C",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e21",
        "enunciado": "Se a matriz A é [[2, 1], [1, 2]], qual o seu autovetor para o autovalor 3?",
        "alternativa_a": "[1, 1]",
        "alternativa_b": "[1, -1]",
        "alternativa_c": "[1, 0]",
        "alternativa_d": "[0, 1]",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e22",
        "enunciado": "Qual o valor do limite lim(x → 0) (1 - cos(x))/x²?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "1/2",
        "alternativa_d": "2",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e23",
        "enunciado": "Calcule a derivada de f(x) = √(x² + 1)",
        "alternativa_a": "x/√(x²+1)",
        "alternativa_b": "1/(2√(x²+1))",
        "alternativa_c": "x",
        "alternativa_d": "1/(x²+1)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e24",
        "enunciado": "Qual é a solução da equação diferencial y' = y²?",
        "alternativa_a": "y = 1/(C - x)",
        "alternativa_b": "y = Ce^x",
        "alternativa_c": "y = x² + C",
        "alternativa_d": "y = 2x + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e25",
        "enunciado": "Qual o valor de (1 + i)²?",
        "alternativa_a": "2",
        "alternativa_b": "2i",
        "alternativa_c": "1 + i",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e26",
        "enunciado": "Calcule a integral de ∫₀¹ 1/(1+x²) dx",
        "alternativa_a": "π/2",
        "alternativa_b": "π/4",
        "alternativa_c": "π",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e27",
        "enunciado": "Qual o determinante da matriz [[1, 0, 0], [0, 2, 0], [0, 0, 3]]?",
        "alternativa_a": "1",
        "alternativa_b": "2",
        "alternativa_c": "3",
        "alternativa_d": "6",
        "resposta_correta": "d",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e28",
        "enunciado": "Qual é a solução particular de y' - y = x com y(0)=1?",
        "alternativa_a": "y = -x - 1 + 2e^x",
        "alternativa_b": "y = x - 1 + e^x",
        "alternativa_c": "y = -x + 1",
        "alternativa_d": "y = e^x - x - 1",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e29",
        "enunciado": "Se f(x) = ln(cos x), qual é a derivada de f(x)?",
        "alternativa_a": "cot x",
        "alternativa_b": "-tan x",
        "alternativa_c": "sec x",
        "alternativa_d": "-cot x",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e30",
        "enunciado": "Qual a integral de ∫ 2x/(x² + 1) dx?",
        "alternativa_a": "ln(x² + 1) + C",
        "alternativa_b": "2ln(x² + 1) + C",
        "alternativa_c": "x² + 1 + C",
        "alternativa_d": "x ln(x² + 1) + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e31",
        "enunciado": "Qual é o valor do limite lim(x → 0) sin(2x)/x?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "2",
        "alternativa_d": "1/2",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e32",
        "enunciado": "Resolva a equação diferencial: y'' - 4y' + 4y = 0",
        "alternativa_a": "y = C₁ e^(2x) + C₂ x e^(2x)",
        "alternativa_b": "y = C₁ e^(2x) + C₂ e^(-2x)",
        "alternativa_c": "y = C₁ x e^(2x) + C₂",
        "alternativa_d": "y = C₁ cos(2x) + C₂ sin(2x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e33",
        "enunciado": "Qual o valor de e^(iπ) + 1?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "-1",
        "alternativa_d": "i",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e34",
        "enunciado": "Calcule a integral de superfície ∫S F.dS para F = xi + yj + zk e a superfície de uma esfera de raio 1.",
        "alternativa_a": "2π",
        "alternativa_b": "4π",
        "alternativa_c": "8π",
        "alternativa_d": "16π",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e35",
        "enunciado": "Qual o limite de ln(x)/(x-1) quando x → 1?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "e",
        "alternativa_d": "∞",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e36",
        "enunciado": "Se A é uma matriz 3x3 com det(A) = 5, qual é o det(2A)?",
        "alternativa_a": "10",
        "alternativa_b": "20",
        "alternativa_c": "40",
        "alternativa_d": "80",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e37",
        "enunciado": "Calcule a derivada de f(x) = x ln x",
        "alternativa_a": "1 + ln x",
        "alternativa_b": "1/x",
        "alternativa_c": "ln x",
        "alternativa_d": "x ln x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e38",
        "enunciado": "Qual o valor da integral de ∫₀^∞ e^(-x) dx?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "∞",
        "alternativa_d": "-1",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e39",
        "enunciado": "Qual a série de Taylor de e^x em torno de x=0?",
        "alternativa_a": "Σ_{n=0}^∞ x^n/n!",
        "alternativa_b": "Σ_{n=0}^∞ x^n",
        "alternativa_c": "Σ_{n=0}^∞ x^(2n)/(2n)!",
        "alternativa_d": "Σ_{n=0}^∞ (-1)^n x^(2n+1)/(2n+1)!",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e40",
        "enunciado": "Resolva a equação diferencial: y' + y = 0 com y(0)=1",
        "alternativa_a": "y = e^x",
        "alternativa_b": "y = e^(-x)",
        "alternativa_c": "y = -e^x",
        "alternativa_d": "y = x² - 1",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e41",
        "enunciado": "Se z = 1 + i, qual é a forma polar de z?",
        "alternativa_a": "√2(cos(π/4) + isin(π/4))",
        "alternativa_b": "(cos(π/4) + isin(π/4))",
        "alternativa_c": "√2(cos(π/2) + isin(π/2))",
        "alternativa_d": "1 + i",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e42",
        "enunciado": "Qual é a transformada de Laplace de f(t) = 1?",
        "alternativa_a": "1/s",
        "alternativa_b": "s",
        "alternativa_c": "1",
        "alternativa_d": "e^(-s)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e43",
        "enunciado": "Calcule a derivada de f(x) = arctan(x)",
        "alternativa_a": "1/(1-x²)",
        "alternativa_b": "1/(1+x²)",
        "alternativa_c": "1/(1-x)",
        "alternativa_d": "1/(x+1)",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e44",
        "enunciado": "Qual é a solução da equação diferencial y'' + 4y = 0?",
        "alternativa_a": "y = C₁ cos(2x) + C₂ sin(2x)",
        "alternativa_b": "y = C₁ e^(2x) + C₂ e^(-2x)",
        "alternativa_c": "y = C₁ cos(x) + C₂ sin(x)",
        "alternativa_d": "y = C₁ e^(-2x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e45",
        "enunciado": "Se f(x) = |x|, qual a derivada de f(x)?",
        "alternativa_a": "1",
        "alternativa_b": "-1",
        "alternativa_c": "sgn(x)",
        "alternativa_d": "x",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e46",
        "enunciado": "Qual o valor da integral ∫₀¹ x² dx?",
        "alternativa_a": "1/2",
        "alternativa_b": "1/3",
        "alternativa_c": "1",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e47",
        "enunciado": "Se a matriz A é [[0, 1], [1, 0]], quais são os seus autovalores?",
        "alternativa_a": "1, 1",
        "alternativa_b": "-1, -1",
        "alternativa_c": "1, -1",
        "alternativa_d": "0, 1",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e48",
        "enunciado": "Resolva a equação diferencial: y' = xy",
        "alternativa_a": "y = C e^(x²/2)",
        "alternativa_b": "y = C e^(x²)",
        "alternativa_c": "y = C e^x",
        "alternativa_d": "y = x²/2 + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e49",
        "enunciado": "Qual é o valor da integral ∫₀π sin(x) dx?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "2",
        "alternativa_d": "2π",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e50",
        "enunciado": "Se z = 1 - i, qual é o seu conjugado?",
        "alternativa_a": "-1 - i",
        "alternativa_b": "-1 + i",
        "alternativa_c": "1 + i",
        "alternativa_d": "1 - i",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e51",
        "enunciado": "Calcule a derivada parcial de f(x,y) = x² y³ em relação a x.",
        "alternativa_a": "2xy³",
        "alternativa_b": "2x",
        "alternativa_c": "3x² y²",
        "alternativa_d": "y³",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e52",
        "enunciado": "Qual é a solução da equação diferencial y'' + 2y' + y = 0?",
        "alternativa_a": "y = C₁ e⁻ˣ + C₂ x e⁻ˣ",
        "alternativa_b": "y = C₁ e⁻ˣ + C₂ eˣ",
        "alternativa_c": "y = C₁ eˣ + C₂ x eˣ",
        "alternativa_d": "y = C₁ cos x + C₂ sin x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e53",
        "enunciado": "Qual o valor do limite lim(x → ∞) (2x² + 3x - 1)/(x² + 5)?",
        "alternativa_a": "2",
        "alternativa_b": "3",
        "alternativa_c": "0",
        "alternativa_d": "∞",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e54",
        "enunciado": "Se a matriz A é [[1, 1], [1, 1]], quais são os seus autovalores?",
        "alternativa_a": "0, 2",
        "alternativa_b": "1, 1",
        "alternativa_c": "-1, 1",
        "alternativa_d": "0, 1",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e55",
        "enunciado": "Calcule a integral de ∫₁ᵉ ln(x) dx",
        "alternativa_a": "1",
        "alternativa_b": "e",
        "alternativa_c": "e-1",
        "alternativa_d": "0",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e56",
        "enunciado": "Qual a derivada parcial de f(x,y) = x³y + y² em relação a y?",
        "alternativa_a": "3x²y",
        "alternativa_b": "x³ + 2y",
        "alternativa_c": "x³",
        "alternativa_d": "2y",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e57",
        "enunciado": "Qual é a transformada de Laplace de f(t) = t?",
        "alternativa_a": "1/s",
        "alternativa_b": "1/s²",
        "alternativa_c": "1",
        "alternativa_d": "s",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e58",
        "enunciado": "Resolva a equação diferencial: y' = y sin x",
        "alternativa_a": "y = C e^(-cos x)",
        "alternativa_b": "y = C e^(cos x)",
        "alternativa_c": "y = C sin x",
        "alternativa_d": "y = C cos x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e59",
        "enunciado": "Qual o valor do limite lim(x → 0) (1+x)^(1/x)?",
        "alternativa_a": "1",
        "alternativa_b": "e",
        "alternativa_c": "0",
        "alternativa_d": "∞",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e60",
        "enunciado": "Calcule a integral de ∫₀¹ x e^(x²) dx",
        "alternativa_a": "(e-1)/2",
        "alternativa_b": "e-1",
        "alternativa_c": "e",
        "alternativa_d": "1/2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e61",
        "enunciado": "Se a matriz A é [[1, 2, 3], [0, 4, 5], [0, 0, 6]], qual é o seu determinante?",
        "alternativa_a": "1",
        "alternativa_b": "6",
        "alternativa_c": "24",
        "alternativa_d": "120",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e62",
        "enunciado": "Qual é a solução da equação diferencial: y'' - 5y' + 6y = 0?",
        "alternativa_a": "y = C₁ e^(2x) + C₂ e^(3x)",
        "alternativa_b": "y = C₁ e^(2x) + C₂ e^(-3x)",
        "alternativa_c": "y = C₁ e^(-2x) + C₂ e^(-3x)",
        "alternativa_d": "y = C₁ cos(x) + C₂ sin(x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e63",
        "enunciado": "Se z = iⁱ, qual é o valor principal?",
        "alternativa_a": "e^(-π/2)",
        "alternativa_b": "e^(π/2)",
        "alternativa_c": "π/2",
        "alternativa_d": "-π/2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e64",
        "enunciado": "Calcule a integral de superfície de um campo escalar f(x,y,z) = x² na superfície de uma esfera de raio 1.",
        "alternativa_a": "2π/3",
        "alternativa_b": "4π/3",
        "alternativa_c": "π/3",
        "alternativa_d": "4π",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e65",
        "enunciado": "Qual o limite de (sin(x) - x)/x³ quando x → 0?",
        "alternativa_a": "-1/6",
        "alternativa_b": "1/6",
        "alternativa_c": "0",
        "alternativa_d": "∞",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e66",
        "enunciado": "Se a matriz A é [[1, 1, 1], [0, 1, 1], [0, 0, 1]], qual é a sua inversa?",
        "alternativa_a": "[[1, -1, 0], [0, 1, -1], [0, 0, 1]]",
        "alternativa_b": "[[1, -1, 0], [0, 1, 1], [0, 0, 1]]",
        "alternativa_c": "[[1, 1, -1], [0, 1, -1], [0, 0, 1]]",
        "alternativa_d": "[[1, 1, 1], [0, 1, 1], [0, 0, 1]]",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e67",
        "enunciado": "Calcule a integral de ∫ x sin(x) dx",
        "alternativa_a": "x cos x + sin x + C",
        "alternativa_b": "-x cos x + sin x + C",
        "alternativa_c": "x sin x + cos x + C",
        "alternativa_d": "x cos x - sin x + C",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e68",
        "enunciado": "Qual é a solução da equação diferencial: y'' + 9y = 0?",
        "alternativa_a": "y = C₁ cos(3x) + C₂ sin(3x)",
        "alternativa_b": "y = C₁ e^(3x) + C₂ e^(-3x)",
        "alternativa_c": "y = C₁ cos(x) + C₂ sin(x)",
        "alternativa_d": "y = C₁ e^(-3x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e69",
        "enunciado": "Se z = -1 + i√3, qual é o seu argumento?",
        "alternativa_a": "π/3",
        "alternativa_b": "2π/3",
        "alternativa_c": "-π/3",
        "alternativa_d": "π/6",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e70",
        "enunciado": "Calcule a integral de ∫₀^∞ 1/(x²+1) dx",
        "alternativa_a": "π/2",
        "alternativa_b": "π/4",
        "alternativa_c": "π",
        "alternativa_d": "0",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e71",
        "enunciado": "Qual a derivada de f(x) = ln(x² + 1)?",
        "alternativa_a": "2x/(x²+1)",
        "alternativa_b": "1/(x²+1)",
        "alternativa_c": "2x",
        "alternativa_d": "ln(2x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e72",
        "enunciado": "Qual o valor do limite lim(x → 0) x ln x?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "-1",
        "alternativa_d": "∞",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e73",
        "enunciado": "Qual é a solução da equação diferencial: y' = x e^x com y(0)=1?",
        "alternativa_a": "y = (x-1)e^x + 2",
        "alternativa_b": "y = x e^x + 1",
        "alternativa_c": "y = e^x + x",
        "alternativa_d": "y = x e^x - e^x + 2",
        "resposta_correta": "d",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e74",
        "enunciado": "Qual o valor de cosh²(x) - sinh²(x)?",
        "alternativa_a": "sinh(2x)",
        "alternativa_b": "cosh(2x)",
        "alternativa_c": "1",
        "alternativa_d": "0",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e75",
        "enunciado": "Calcule a integral de ∫₀¹ x/(x²+1) dx",
        "alternativa_a": "½ ln(2)",
        "alternativa_b": "ln(2)",
        "alternativa_c": "1/2",
        "alternativa_d": "0",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e76",
        "enunciado": "Se a matriz A é [[3, 1], [2, 4]], qual é o seu autovalor?",
        "alternativa_a": "2, 5",
        "alternativa_b": "1, 6",
        "alternativa_c": "3, 4",
        "alternativa_d": "1, 2",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e77",
        "enunciado": "Qual é a transformada de Laplace de cos(at)?",
        "alternativa_a": "s/(s²+a²)",
        "alternativa_b": "a/(s²+a²)",
        "alternativa_c": "1/(s²+a²)",
        "alternativa_d": "s/(s²-a²)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e78",
        "enunciado": "Resolva a equação diferencial: y'' - y = 0",
        "alternativa_a": "y = C₁ e^x + C₂ e⁻ˣ",
        "alternativa_b": "y = C₁ cos x + C₂ sin x",
        "alternativa_c": "y = C₁ x + C₂",
        "alternativa_d": "y = C₁ e^x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e79",
        "enunciado": "Qual o valor de i² + i³ + i⁴?",
        "alternativa_a": "0",
        "alternativa_b": "-1",
        "alternativa_c": "1",
        "alternativa_d": "i",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e80",
        "enunciado": "Calcule a integral de linha ∫C F.dr para F = xi + yj e o círculo unitário x²+y²=1",
        "alternativa_a": "0",
        "alternativa_b": "2π",
        "alternativa_c": "π",
        "alternativa_d": "-2π",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e81",
        "enunciado": "Qual a derivada de f(x) = log₁₀(x)?",
        "alternativa_a": "1/x",
        "alternativa_b": "1/(x ln 10)",
        "alternativa_c": "(ln 10)/x",
        "alternativa_d": "ln 10",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e82",
        "enunciado": "Qual o limite de lim(x → 0) (1+x)ˣ?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "e",
        "alternativa_d": "∞",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e83",
        "enunciado": "Se a matriz A é [[1, 1, 0], [1, 0, 1], [0, 1, 1]], qual é o seu determinante?",
        "alternativa_a": "-2",
        "alternativa_b": "0",
        "alternativa_c": "2",
        "alternativa_d": "4",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e84",
        "enunciado": "Qual é a solução da equação diferencial: y'' - y' - 2y = 0?",
        "alternativa_a": "y = C₁ e^(2x) + C₂ e⁻ˣ",
        "alternativa_b": "y = C₁ e^(2x) + C₂ e^x",
        "alternativa_c": "y = C₁ e^(-2x) + C₂ e^x",
        "alternativa_d": "y = C₁ cos(2x) + C₂ sin(2x)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e85",
        "enunciado": "Calcule a integral de ∫₀^∞ e⁻²ˣ dx",
        "alternativa_a": "1",
        "alternativa_b": "1/2",
        "alternativa_c": "2",
        "alternativa_d": "0",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e86",
        "enunciado": "Se z = 1 + √3i, qual é a sua forma polar?",
        "alternativa_a": "2e^(iπ/3)",
        "alternativa_b": "2e^(-iπ/3)",
        "alternativa_c": "e^(iπ/3)",
        "alternativa_d": "e^(iπ/6)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e87",
        "enunciado": "Qual a derivada de f(x) = x ln(x²)?",
        "alternativa_a": "2ln x + 2",
        "alternativa_b": "2ln x",
        "alternativa_c": "1/x",
        "alternativa_d": "x",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e88",
        "enunciado": "Resolva a equação diferencial: y'' + 4y' + 3y = 0",
        "alternativa_a": "y = C₁ e⁻ˣ + C₂ e⁻³ˣ",
        "alternativa_b": "y = C₁ eˣ + C₂ e³ˣ",
        "alternativa_c": "y = C₁ cos x + C₂ sin x",
        "alternativa_d": "y = C₁ eˣ + C₂ x eˣ",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e89",
        "enunciado": "Qual o valor de i¹⁰¹?",
        "alternativa_a": "1",
        "alternativa_b": "-1",
        "alternativa_c": "i",
        "alternativa_d": "-i",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e90",
        "enunciado": "Calcule a integral de ∫ 1/(x² - 1) dx",
        "alternativa_a": "½ ln |(x-1)/(x+1)| + C",
        "alternativa_b": "ln|x²-1|+C",
        "alternativa_c": "arctan(x) + C",
        "alternativa_d": "arcsin(x) + C",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e91",
        "enunciado": "Se a matriz A é [[1, 0, 0], [0, 0, 1], [0, 1, 0]], qual é o seu determinante?",
        "alternativa_a": "1",
        "alternativa_b": "-1",
        "alternativa_c": "0",
        "alternativa_d": "2",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e92",
        "enunciado": "Qual o limite de lim(x → 0) (e^x - 1)/x?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "e",
        "alternativa_d": "∞",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e93",
        "enunciado": "Qual a solução da equação diferencial: y'' + y = cos x?",
        "alternativa_a": "y = C₁ cos x + C₂ sin x",
        "alternativa_b": "y_p = ½x sin x",
        "alternativa_c": "y_p = ½sin x",
        "alternativa_d": "y_p = x cos x",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e94",
        "enunciado": "Calcule a integral de ∫ sin x/cos x dx",
        "alternativa_a": "ln|sin x| + C",
        "alternativa_b": "ln|cos x| + C",
        "alternativa_c": "-ln|cos x| + C",
        "alternativa_d": "tan x + C",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e95",
        "enunciado": "Se z = 2e^(iπ/2), qual é a forma retangular de z?",
        "alternativa_a": "2",
        "alternativa_b": "2i",
        "alternativa_c": "-2",
        "alternativa_d": "-2i",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e96",
        "enunciado": "Qual a derivada de f(x) = cos(x²)?",
        "alternativa_a": "2x sin(x²)",
        "alternativa_b": "-sin(x²)",
        "alternativa_c": "-2x sin(x²)",
        "alternativa_d": "2x cos(x²)",
        "resposta_correta": "c",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e97",
        "enunciado": "Qual o valor de sin(π/4) + cos(π/4)?",
        "alternativa_a": "1",
        "alternativa_b": "√2",
        "alternativa_c": "√3",
        "alternativa_d": "2",
        "resposta_correta": "b",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e98",
        "enunciado": "Qual é a transformada de Laplace de sin(at)?",
        "alternativa_a": "a/(s²+a²)",
        "alternativa_b": "s/(s²+a²)",
        "alternativa_c": "a/(s²-a²)",
        "alternativa_d": "s/(s²-a²)",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e99",
        "enunciado": "Resolva a equação diferencial: y' - y = 1",
        "alternativa_a": "y = C e^x - 1",
        "alternativa_b": "y = C e^x + 1",
        "alternativa_c": "y = C e⁻ˣ - 1",
        "alternativa_d": "y = C e⁻ˣ + 1",
        "resposta_correta": "a",
        "nivel": "expert"
      },
      {
        "id_pergunta": "e100",
        "enunciado": "Qual o limite de lim(x → ∞) e^x / x?",
        "alternativa_a": "0",
        "alternativa_b": "1",
        "alternativa_c": "e",
        "alternativa_d": "∞",
        "resposta_correta": "d",
        "nivel": "expert"
      }
    ],
    };

    const questions = mockQuestions[nivel] || [];
    return questions.slice(0, limit);
  }
}