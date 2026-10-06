import React, { useState } from 'react';
import { GradeLevel, LocalPlayer, Question, UserProfile } from '../../types';
import {
  GRADE_LABELS,
  getQuestionsForMatch,
  getTiebreakerQuestions,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Users,
  Swords,
  CheckCircle2,
  XCircle,
  Play,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface PassAndPlayModeProps {
  user: UserProfile;
  onBack: () => void;
  onAnswerCorrect?: () => void;
  onMatchFinished?: (winnerIsUser: boolean, correctCount: number) => void;
  onEarnPoints?: (points: number, isMajor?: boolean, count?: number) => void;
}

const PLAYER_AVATARS = ['🎓', '🦁', '🦉', '🚀', '⭐'];

export const PassAndPlayMode: React.FC<PassAndPlayModeProps> = ({
  user,
  onBack,
  onAnswerCorrect,
  onMatchFinished,
  onEarnPoints,
}) => {
  const [step, setStep] = useState<'setup_count' | 'setup_players' | 'turn_ready' | 'playing' | 'tiebreaker' | 'winner'>('setup_count');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [matchSubject, setMatchSubject] = useState<'all' | 'historia' | 'geografia' | 'portugues' | 'ciencias' | 'matematica' | 'ingles'>('all');
  const [players, setPlayers] = useState<LocalPlayer[]>([]);

  // Game state
  const [playerQuestions, setPlayerQuestions] = useState<Record<string, Question[]>>({});
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0); // 0 to 4 (5 questions per player)

  // Current question interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Tiebreaker state
  const [tiedPlayerIds, setTiedPlayerIds] = useState<string[]>([]);
  const [tiebreakerPool, setTiebreakerPool] = useState<Question[]>([]);
  const [tiebreakerIndex, setTiebreakerIndex] = useState<number>(0);

  // Winner
  const [winner, setWinner] = useState<LocalPlayer | null>(null);

  // STEP 1: Select Player Count (1 to 5)
  const handleSelectCount = (count: number) => {
    soundEffects.playClick();
    setPlayerCount(count);

    // Initialize players list
    const initialPlayers: LocalPlayer[] = Array.from({ length: count }, (_, i) => ({
      id: `player_${i}`,
      name: i === 0 ? user.name || 'Jogador 1' : `Jogador ${i + 1}`,
      grade: i === 0 ? user.grade : '6_fund',
      avatar: PLAYER_AVATARS[i % PLAYER_AVATARS.length],
      score: 0,
      errors: 0,
      answeredCount: 0,
      answers: [],
    }));

    setPlayers(initialPlayers);
    setStep('setup_players');
  };

  // STEP 2: Configure each player's name & grade
  const handleUpdatePlayer = (index: number, field: keyof LocalPlayer, value: any) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleStartGame = () => {
    soundEffects.playClick();

    // Generate 5 questions for each player according to their specific grade and selected subject!
    const questionsMap: Record<string, Question[]> = {};
    players.forEach((p) => {
      questionsMap[p.id] = getQuestionsForMatch(p.grade, 5, 'medium', matchSubject);
    });

    setPlayerQuestions(questionsMap);
    setActivePlayerIndex(0);
    setCurrentRound(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setStep('turn_ready');
  };

  // Turn ready -> Start answering
  const handleStartTurn = () => {
    soundEffects.playClick();
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setStep('playing');
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const activePlayer = players[activePlayerIndex];
    const currentQ = playerQuestions[activePlayer.id][currentRound];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      if (typeof onAnswerCorrect === 'function') {
        onAnswerCorrect();
      }
      if (typeof onEarnPoints === 'function' && activePlayer.id === players[0].id) {
        onEarnPoints(10, false, 1);
      }
    } else {
      soundEffects.playError();
    }

    // Update player score
    setPlayers((prev) => {
      const copy = [...prev];
      const p = copy[activePlayerIndex];
      if (isCorrect) p.score += 1;
      else p.errors += 1;
      p.answeredCount += 1;
      p.answers.push(isCorrect);
      return copy;
    });
  };

  // Next Turn or Round or Tiebreaker
  const handleNextTurn = () => {
    soundEffects.playClick();

    const nextPlayerIndex = activePlayerIndex + 1;

    if (nextPlayerIndex < players.length) {
      // Next player's turn for the current round
      setActivePlayerIndex(nextPlayerIndex);
      setStep('turn_ready');
    } else {
      // All players answered this round
      const nextRound = currentRound + 1;
      if (nextRound < 5) {
        // Move to next round
        setCurrentRound(nextRound);
        setActivePlayerIndex(0);
        setStep('turn_ready');
      } else {
        // Match 5 questions finished! Check for ties
        evaluateMatchResult();
      }
    }
  };

  const evaluateMatchResult = () => {
    const maxScore = Math.max(...players.map((p) => p.score));
    const topPlayers = players.filter((p) => p.score === maxScore);

    if (topPlayers.length === 1) {
      // Definitive winner!
      const userWon = topPlayers[0].id === players[0].id;
      setWinner(topPlayers[0]);
      setStep('winner');
      if (typeof onMatchFinished === 'function') {
        onMatchFinished(userWon, topPlayers[0].score);
      }
      if (typeof onEarnPoints === 'function') {
        onEarnPoints(userWon ? 50 : 20, true, 0);
      }
    } else {
      // TIE! Prepare tiebreaker with lighter questions from grade below!
      soundEffects.playError();
      const tiedIds = topPlayers.map((p) => p.id);
      setTiedPlayerIds(tiedIds);

      // Collect tiebreaker questions from the grade below of the highest grade among tied players
      const primaryGrade = topPlayers[0].grade;
      const tiebreakers = getTiebreakerQuestions(primaryGrade, matchSubject);
      setTiebreakerPool(tiebreakers);
      setTiebreakerIndex(0);
      setActivePlayerIndex(0);
      setStep('tiebreaker');
    }
  };

  // Tiebreaker Submit
  const handleTiebreakerSubmit = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const currentTiedPlayer = players.find((p) => p.id === tiedPlayerIds[activePlayerIndex]);
    if (!currentTiedPlayer) return;

    const currentQ = tiebreakerPool[tiebreakerIndex % tiebreakerPool.length];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      if (typeof onAnswerCorrect === 'function') {
        onAnswerCorrect();
      }
      if (typeof onEarnPoints === 'function' && currentTiedPlayer.id === players[0].id) {
        onEarnPoints(10, false, 1);
      }
    } else {
      soundEffects.playError();
    }

    setPlayers((prev) => {
      const copy = [...prev];
      const p = copy.find((item) => item.id === currentTiedPlayer.id);
      if (p) {
        if (isCorrect) p.score += 1;
        else p.errors += 1;
      }
      return copy;
    });
  };

  // Tiebreaker Next Turn
  const handleTiebreakerNext = () => {
    soundEffects.playClick();
    const nextIdx = activePlayerIndex + 1;

    if (nextIdx < tiedPlayerIds.length) {
      setActivePlayerIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed a tiebreaker round for all tied players
      const tiedPlayersList = players.filter((p) => tiedPlayerIds.includes(p.id));
      const maxScore = Math.max(...tiedPlayersList.map((p) => p.score));
      const newTop = tiedPlayersList.filter((p) => p.score === maxScore);

      if (newTop.length === 1) {
        // Clear winner resolved!
        const userWon = newTop[0].id === players[0].id;
        setWinner(newTop[0]);
        setStep('winner');
        if (typeof onMatchFinished === 'function') {
          onMatchFinished(userWon, newTop[0].score);
        }
        if (typeof onEarnPoints === 'function') {
          onEarnPoints(userWon ? 50 : 20, true, 0);
        }
      } else {
        // Still tied! Next tiebreaker question
        setTiedPlayerIds(newTop.map((p) => p.id));
        setTiebreakerIndex((prev) => prev + 1);
        setActivePlayerIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    }
  };

  const activePlayer = players[activePlayerIndex];
  const currentQuestion = activePlayer ? playerQuestions[activePlayer.id]?.[currentRound] : null;

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            if (step === 'setup_count') onBack();
            else if (step === 'setup_players') setStep('setup_count');
            else onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 'setup_count' ? 'Menu Principal' : 'Voltar'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-xs font-semibold">
          <Swords className="w-3.5 h-3.5" />
          <span>Competição Local (1 a 5 Jogadores)</span>
        </div>
      </div>

      {/* STEP 1: CHOOSE PLAYER COUNT (1-5) */}
      {step === 'setup_count' && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 mb-1">Quantas pessoas vão jogar?</h2>
            <p className="text-xs text-zinc-400 mb-5">
              Escolha de 1 a 5 jogadores. Cada um responderá 5 perguntas da sua própria série escolar!
            </p>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelectCount(num)}
                  className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                    playerCount === num
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold scale-105 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Users className="w-5 h-5 text-rose-400" />
                  <span className="text-lg font-black">{num}</span>
                  <span className="text-[10px] text-zinc-400">
                    {num === 1 ? 'Solo' : `${num} Jog.`}
                  </span>
                </button>
              ))}
            </div>

            {/* Rules explanation box */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-bold text-zinc-200 block">Regras da Batalha:</span>
              <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Cada jogador responde <strong>5 perguntas</strong> da sua série.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Ganha quem acertar mais (+1 troféu por acerto).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Em caso de empate: <strong>Morte súbita com perguntas leves da série anterior</strong> até desempatar!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SETUP PLAYERS NAMES & GRADES */}
      {step === 'setup_players' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 mb-0.5">Nome e Série de Cada Jogador</h2>
              <p className="text-xs text-zinc-400">
                Personalize as perguntas de acordo com o ano escolar de cada um.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-xs font-bold text-rose-400">Jogador {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                        Nome / Apelido
                      </label>
                      <input
                        type="text"
                        value={p.name}
                        maxLength={16}
                        onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-hidden focus:border-rose-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                        Série Escolar
                      </label>
                      <select
                        value={p.grade}
                        onChange={(e) =>
                          handleUpdatePlayer(idx, 'grade', e.target.value as GradeLevel)
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-zinc-100 focus:outline-hidden focus:border-rose-500 font-medium"
                      >
                        {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                          <option key={g} value={g}>
                            {GRADE_LABELS[g].short}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Conteúdo das Perguntas do Duelo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'all', name: '📚 Todas as Matérias', activeClass: 'bg-blue-500/20 border-blue-500 text-blue-300' },
                  { id: 'historia', name: '📜 História', activeClass: 'bg-amber-500/20 border-amber-500 text-amber-300' },
                  { id: 'geografia', name: '🌍 Geografia', activeClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
                  { id: 'portugues', name: '📖 Português', activeClass: 'bg-indigo-500/20 border-indigo-500 text-indigo-300' },
                  { id: 'ciencias', name: '🔬 Ciências', activeClass: 'bg-teal-500/20 border-teal-500 text-teal-300' },
                  { id: 'matematica', name: '📐 Matemática', activeClass: 'bg-purple-500/20 border-purple-500 text-purple-300' },
                  { id: 'ingles', name: '🇬🇧 Inglês', activeClass: 'bg-rose-500/20 border-rose-500 text-rose-300' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMatchSubject(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center text-center ${
                      matchSubject === item.id
                        ? item.activeClass
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Competição de 5 Perguntas</span>
          </button>
        </div>
      )}

      {/* STEP 3: TURN READY BANNER (PASS THE PHONE) */}
      {step === 'turn_ready' && activePlayer && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-5xl mb-4 shadow-xl">
            {activePlayer.avatar}
          </div>

          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">
            Rodada {currentRound + 1} de 5
          </span>
          <h2 className="text-2xl font-black text-zinc-100 mb-1">Vez de {activePlayer.name}!</h2>
          <p className="text-xs text-zinc-400 max-w-xs mb-2">
            Série configurada: <strong className="text-zinc-200">{GRADE_LABELS[activePlayer.grade].full}</strong>
          </p>
          <p className="text-[11px] text-zinc-500 mb-6">
            Passe o aparelho para {activePlayer.name} e clique para ver a pergunta!
          </p>

          <button
            onClick={handleStartTurn}
            className="w-full max-w-xs py-3.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Estou Pronto, Mostrar Pergunta</span>
          </button>
        </div>
      )}

      {/* STEP 4: PLAYING QUESTION */}
      {step === 'playing' && activePlayer && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Player header */}
            <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activePlayer.avatar}</span>
                <div>
                  <span className="font-bold text-zinc-100 block">{activePlayer.name}</span>
                  <span className="text-[10px] text-zinc-400">{GRADE_LABELS[activePlayer.grade].short}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 font-semibold text-[11px]">
                  Pergunta {currentRound + 1}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                  {activePlayer.score} pts
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                {currentQuestion.topic}
              </span>
              <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Voice Answering Control */}
            <VoiceAnswerController
              options={currentQuestion.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={(idx) => {
                soundEffects.playClick();
                setSelectedOption(idx);
              }}
              onSubmitAnswer={handleSubmitAnswer}
              onNextQuestion={handleNextTurn}
            />

            {/* Options */}
            <div className="space-y-2 text-xs">
              {(currentQuestion.options || []).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  } else {
                    optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                  }
                } else if (isSelected) {
                  optionStyles = 'bg-rose-950/60 border-rose-500 text-rose-100 font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        soundEffects.playClick();
                        setSelectedOption(idx);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswerSubmitted && (
              <div className="mt-3.5 p-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-xs">
                <span className="font-bold text-zinc-200 block mb-0.5">Explicação:</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition ${
                  selectedOption !== null
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextTurn}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>
                  {activePlayerIndex + 1 < players.length
                    ? `Passar para ${players[activePlayerIndex + 1].name}`
                    : currentRound + 1 < 5
                    ? 'Iniciar Próxima Rodada'
                    : 'Ver Resultado da Partida'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: TIEBREAKER SUDDEN DEATH */}
      {step === 'tiebreaker' && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Tiebreaker Header Notice */}
            <div className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase mb-0.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Desempate • Morte Súbita!</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Perguntas leves da série anterior até um jogador assumir a liderança!
              </p>
            </div>

            {/* Active tied player turn */}
            {(() => {
              const currentTied = players.find((p) => p.id === tiedPlayerIds[activePlayerIndex]);
              const tbQ = tiebreakerPool[tiebreakerIndex % tiebreakerPool.length];
              if (!currentTied || !tbQ) return null;

              return (
                <div>
                  <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentTied.avatar}</span>
                      <span className="font-bold text-zinc-100">{currentTied.name} (Vez)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                      Placar: {currentTied.score} pts
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-4">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Questão de Desempate
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100">{tbQ.question}</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    {(tbQ.options || []).map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === tbQ.correctIndex;
                      let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300';

                      if (isAnswerSubmitted) {
                        if (isCorrect) optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                        else if (isSelected && !isCorrect) optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                        else optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                      } else if (isSelected) {
                        optionStyles = 'bg-amber-950/60 border-amber-500 text-amber-100 font-medium';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerSubmitted}
                          onClick={() => {
                            if (!isAnswerSubmitted) {
                              soundEffects.playClick();
                              setSelectedOption(idx);
                            }
                          }}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                        >
                          <span>{opt}</span>
                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-4">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleTiebreakerSubmit}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-40"
              >
                Confirmar Resposta de Desempate
              </button>
            ) : (
              <button
                onClick={handleTiebreakerNext}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Próximo Passo do Desempate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: WINNER CELEBRATION */}
      {step === 'winner' && winner && (
        <VictoryCelebration
          winnerName={winner.name}
          winnerAvatar={winner.avatar}
          scoreText={`Pontuação final: ${winner.score} acertos de 5 questões!`}
          modeTitle="Competição Local"
          onPlayAgain={() => {
            setStep('setup_count');
          }}
          onHome={onBack}
        />
      )}
    </div>
  );
};
