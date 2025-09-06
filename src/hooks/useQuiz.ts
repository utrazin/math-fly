import { useState, useCallback } from 'react';
import { QuizSession, DifficultLevel } from '../types/game';
import { QuizService } from '../services/QuizService';
import { useAuth } from './useAuth';
import { useStats } from './useStats';

const POINTS_BY_LEVEL = {
  facil: 10,
  medio: 20,
  dificil: 30,
  expert: 50
};

const TIME_BY_LEVEL = {
  facil: 30,
  medio: 60,
  dificil: 120,
  expert: 180
};

export function useQuiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshStats } = useStats();

  const startQuiz = useCallback(async (nivel: DifficultLevel, questionCount: number = 5) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    } 
    
    setLoading(true);
    setError(null);
    
    try {
      const questions = await QuizService.getQuestionsByPhase(nivel, questionCount);
      
      if (questions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para o nível ${nivel}`);
      }

      const newSession: QuizSession = {
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        startTime: Date.now(),
        nivel
      };
      
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Erro ao iniciar quiz:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar questões');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const submitAnswer = useCallback((answer: string) => {
    if (!session) {
      return null;
    }

    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.resposta_correta;
    
    const currentTime = Date.now();
    const timePerQuestion = TIME_BY_LEVEL[session.nivel] * 1000;
    const questionStartTime = session.startTime + (session.answers.length * timePerQuestion);
    const timeSpent = Math.max(0, (currentTime - questionStartTime) / 1000);
    const maxTime = TIME_BY_LEVEL[session.nivel];
    const timeBonus = Math.max(0, Math.floor((maxTime - timeSpent) / 5));
    
    const basePoints = POINTS_BY_LEVEL[session.nivel];
    const questionPoints = isCorrect ? basePoints + timeBonus : 0;


    const updatedSession = {
      ...session,
      answers: [...session.answers, answer],
      score: session.score + questionPoints
    };

    setSession(updatedSession);

    return {
      isCorrect,
      correctAnswer: currentQuestion.resposta_correta,
      points: questionPoints,
      isComplete: updatedSession.answers.length === updatedSession.questions.length
    };
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session) {
      return null;
    }

    
    const updatedSession = {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1
    };

    setSession(updatedSession);
    return updatedSession;
  }, [session]);

  const finishQuiz = useCallback(async () => {
    if (!session || !user) {
      return null;
    }

    
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - session.startTime) / 1000);
    const correctAnswers = session.answers.filter(
      (answer, index) => answer === session.questions[index].resposta_correta
    ).length;

    const results = {
      score: session.score,
      correctAnswers,
      totalQuestions: session.questions.length,
      accuracy: (correctAnswers / session.questions.length) * 100,
      timeSpent: totalTime,
      nivel: session.nivel
    };

    try {
      await QuizService.saveQuizResult(user.id, results);
      
      await refreshStats();
      
      return results;
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      
      QuizService.saveOfflineProgress(results);
      
      return results;
    }
}, [session, user, refreshStats]);

  const resetQuiz = useCallback(() => {
    setSession(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    session,
    loading,
    error,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz
  };
}