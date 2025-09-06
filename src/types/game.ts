export type DifficultLevel = 'facil' | 'medio' | 'dificil' | 'expert';

export interface Question {
  id_pergunta: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  resposta_correta: 'a' | 'b' | 'c' | 'd';
  nivel: DifficultLevel;
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  answers: string[];
  score: number;
  startTime: number;
  endTime?: number;
  nivel: DifficultLevel;
}

export interface UserStats {
  totalScore: number;
  totalGames: number;
  averageAccuracy: number;
  bestPhase: DifficultLevel;
  lastPlayed: string;
  maxPhase: number;
}

export interface RankingEntry {
  nome: string;
  pontuacao: number;
  data_partida: string;
}

export interface Performance {
  fase: number;
  acertos: number;
  total_perguntas: number;
  tempo_gasto: number;
  data: string;
  accuracy: number;
}