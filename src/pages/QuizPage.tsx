import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { QuizIntro } from '../components/quiz/QuizIntro';
import { QuizQuestion } from '../components/quiz/QuizQuestion';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizResults } from '../components/quiz/QuizResults';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuiz } from '../hooks/useQuiz';
import { DifficultLevel } from '../types/game';
import { useStats } from '../hooks/useStats';

type QuizState = 'intro' | 'playing' | 'results' | 'loading';


const LEVEL_ORDER: DifficultLevel[] = ['facil', 'medio', 'dificil', 'expert'];

export function QuizPage() {
  const navigate = useNavigate();
  const { level } = useParams<{ level: string }>();
  const { session, loading, startQuiz, submitAnswer, nextQuestion, finishQuiz, resetQuiz } = useQuiz();
  const { userStats } = useStats();
  
  const currentLevel = (level as DifficultLevel) || 'facil';
  const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);
  const hasNextLevel = currentLevelIndex < LEVEL_ORDER.length - 1;
  const nextLevel = hasNextLevel ? LEVEL_ORDER[currentLevelIndex + 1] : null;
  
  const getTimePerQuestion = (level: DifficultLevel): number => {
    const times = {
      facil: 30,
      medio: 60,
      dificil: 120,
      expert: 180
    };
    return times[level];
  };
  
  const timePerQuestion = getTimePerQuestion(currentLevel);

  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  
  const maxPhase = userStats?.maxPhase || 1;
  const currentPhaseNumber = currentLevelIndex + 1;
  const hasAccess = userStats ? currentPhaseNumber <= maxPhase : true;

  useEffect(() => {
    resetQuiz();
    setQuizState('intro');
    setQuizResults(null);
    setSelectedAnswer(null);
    setIsAnswering(false);
    setShowNextButton(false);
  }, [level, resetQuiz]);

  useEffect(() => {
    if (userStats && !hasAccess) {
      navigate('/');
    }
  }, [userStats, hasAccess, currentPhaseNumber, maxPhase, navigate]);

  useEffect(() => {
    if (quizState !== 'playing' || !session || isAnswering || showNextButton) return;

    setTimeLeft(timePerQuestion);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.currentQuestionIndex, quizState, isAnswering, showNextButton, timePerQuestion]);

  const handleStartQuiz = async () => {
    if (!hasAccess) {
      navigate('/');
      return;
    }
    
    setQuizState('loading');
    const newSession = await startQuiz(currentLevel, 5);
    if (newSession) {
      setQuizState('playing');
    } else {
      setQuizState('intro');
    }
  };

  const handleTimeUp = () => {
    if (isAnswering || showNextButton) return;
    handleAnswerClick('');
  };

  const handleAnswerClick = (answer: string) => {
    if (isAnswering || selectedAnswer || !session) return;
    
    
    setIsAnswering(true);
    setSelectedAnswer(answer);
    setShowNextButton(true);
    
    submitAnswer(answer);
    
  };

  const handleNextQuestion = async () => {
    if (!session) return;

    const isLastQuestion = session.currentQuestionIndex + 1 >= session.questions.length;
    
    if (isLastQuestion) {
      setQuizState('loading');
      const results = await finishQuiz();
      if (results) {
        setQuizResults(results);
        setQuizState('results');
      }
    } else {
      nextQuestion();
      setSelectedAnswer(null);
      setIsAnswering(false);
      setShowNextButton(false);
    }
  };

  const handlePlayAgain = () => {
    resetQuiz();
    setQuizState('intro');
    setQuizResults(null);
    setSelectedAnswer(null);
    setIsAnswering(false);
    setShowNextButton(false);
  };

  const handleNextLevel = () => {
    if (nextLevel) {
      const nextPhaseNumber = currentLevelIndex + 2;
      if (nextPhaseNumber <= maxPhase) {
      navigate(`/quiz/${nextLevel}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (quizState === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text={
          quizState === 'loading' && session ? "Finalizando quiz..." : "Preparando quiz..."
        } />
      </div>
    );
  }

  if (quizState === 'intro') {
    if (!userStats) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Carregando informações da fase..." />
        </div>
      );
    }
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">🔒 Fase Bloqueada</h2>
            <p className="text-slate-400 mb-6">
              Você precisa completar as fases anteriores para acessar esta fase.
            </p>
            <Button onClick={handleBackToDashboard}>
              Voltar ao Menu
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <QuizIntro
        level={currentLevel}
        onStart={handleStartQuiz}
        onBack={handleBackToDashboard}
        totalQuestions={5}
        timePerQuestion={timePerQuestion}
      />
    );
  }

  if (quizState === 'results' && quizResults) {
    return (
      <QuizResults
        results={quizResults}
        onPlayAgain={handlePlayAgain}
        onBackToDashboard={handleBackToDashboard}
        onNextLevel={hasNextLevel && (currentLevelIndex + 2) <= maxPhase ? handleNextLevel : undefined}
        hasNextLevel={hasNextLevel && (currentLevelIndex + 2) <= maxPhase}
      />
    );
  }

  if (quizState === 'playing' && session) {
    if (session.currentQuestionIndex >= session.questions.length) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Processando resultados..." />
        </div>
      );
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
              disabled={isAnswering}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sair</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                Nível <span className="capitalize">{currentLevel}</span>
              </h1>
            </div>
            
            <div />
          </div>

          {/* Progress */}
          <QuizProgress
            currentQuestion={session.currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
            score={session.score}
            timeLeft={timeLeft}
            maxTime={timePerQuestion}
          />

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={session.currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <QuizQuestion
                question={currentQuestion}
                onAnswerClick={handleAnswerClick}
                isAnswered={isAnswering}
                selectedAnswer={selectedAnswer}
                correctAnswer={currentQuestion.resposta_correta}
                showNextButton={showNextButton}
                onNextQuestion={handleNextQuestion}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );
}