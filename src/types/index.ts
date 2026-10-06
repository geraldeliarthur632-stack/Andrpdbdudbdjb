export type GradeLevel =
  | '1_fund'
  | '2_fund'
  | '3_fund'
  | '4_fund'
  | '5_fund'
  | '6_fund'
  | '7_fund'
  | '8_fund'
  | '9_fund'
  | '1_medio'
  | '2_medio'
  | '3_medio'
  | 'enem';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Faixas etárias para conformidade com a Política para Famílias do Google Play:
 * - 'crianca': até 12 anos
 * - 'adolescente': 13 a 17 anos
 * - 'adulto': 18 anos ou mais
 * - 'nao_informada': Idade não informada
 *
 * NOTA DE PRIVACIDADE: Não armazenamos data de nascimento nem a idade exata da pessoa.
 */
export type AgeGroup = 'crianca' | 'adolescente' | 'adulto' | 'nao_informada';

export type AppMode =
  | 'tabs'
  | 'caderno'
  | 'journey'
  | 'custom'
  | 'explainer'
  | 'researcher'
  | 'challenges'
  | 'chess'
  | 'math'
  | 'competition'
  | 'multiplayer'
  | 'duel'
  | 'wordsearch'
  | 'crossword'
  | 'puzzle'
  | 'times_table'
  | 'languages'
  | 'translator'
  | 'photo_exam'
  | 'memory'
  | 'lightning';

export interface UserProfile {
  name: string;
  grade: GradeLevel;
  avatar: string;
  avatarId?: string;
  ageGroup?: AgeGroup; // Faixa etária para conformidade Google Play Famílias
  isFirstTime?: boolean;
  hasSeenIntro?: boolean;
  totalPoints: number;
  completedChallenges: number;
  totalCorrectAnswers?: number;
  customSubjects?: SubjectId[];
  hasConfiguredSubjects?: boolean;
  email?: string;
  phoneNumber?: string;
  userId?: string;
  photoURL?: string;
  lastSyncedAt?: string;
  equippedSound?: string;
}

export type ErrorCategory =
  | 'questao'
  | 'bug'
  | 'ia_explicador'
  | 'materia'
  | 'sugestao'
  | 'outro';

export type ErrorStatus = 'em_analise' | 'investigando' | 'resolvido';

export interface UserErrorReport {
  id: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  userGrade?: string;
  category: ErrorCategory;
  title: string;
  description: string;
  createdAt: string;
  status: ErrorStatus;
  upvotes: number;
  upvotedBy?: string[];
  adminResponse?: string;
  aiCorrection?: string;
  correctedQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  appliedOnlyForUserId?: string;
  questionContext?: any;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  category: string;
}

export interface TrophyItem {
  id: string;
  title: string;
  description: string;
  correctAnswersRequired: number;
  icon: string;
  metal: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  rarityLabel: string;
}

export type SubjectId =
  | 'matematica'
  | 'portugues'
  | 'ciencias'
  | 'historia'
  | 'geografia'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'ingles'
  | 'espanhol'
  | 'italiano'
  | 'artes'
  | 'xadrez';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  description: string;
  isBeginnerFromZero?: boolean;
}

export type QuestionKind = 'multiple_choice' | 'true_false' | 'voice_speech';

export interface Question {
  id: string;
  subject: SubjectId | string;
  grade: GradeLevel;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isTiebreaker?: boolean;
  category?: string;
  gradeOriginLabel?: string; // e.g. "Revisão (1º Ano)" ou "Atual (2º Ano)"
  questionType?: QuestionKind; // 'multiple_choice' | 'true_false' | 'voice_speech'
  expectedVoicePhrases?: string[]; // Frases ou palavras-chave esperadas para falar
  fallbackOptions?: string[]; // Opções de fallback caso o usuário não consiga falar
  fallbackType?: 'multiple_choice' | 'true_false'; // Tipo de questão após pular voz
  isTrueFalse?: boolean; // Facilitador booleano
  isVoiceQuestion?: boolean; // Se a questão pede pronúncia/resposta por voz
}

export interface TopicLesson {
  id: string;
  subject: SubjectId;
  grade: GradeLevel;
  title: string;
  // Phase 1: Revision explanation for the first 5 questions
  revisionTitle?: string;
  revisionSummary?: string;
  revisionDetailedExplanation?: string;
  revisionKeyPoints?: string[];
  revisionExample?: string;
  // Phase 2: Current grade explanation for the next 5 questions
  summary: string;
  detailedExplanation?: string;
  keyPoints: string[];
  example: string;
  practiceQuestions: Question[];
}

export interface LocalPlayer {
  id: string;
  name: string;
  grade: GradeLevel;
  avatar: string;
  score: number;
  errors: number;
  answeredCount: number;
  answers: boolean[];
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  grade: GradeLevel;
  score: number;
  errors: number;
  currentQuestionIndex: number;
  isReady: boolean;
  connected: boolean;
  isBot?: boolean;
  reaction?: string;
  reactionTime?: number;
}

export type GameRoomType = 'general' | 'chess' | 'math' | 'stop' | 'speed_reflex';

export interface StopCategoryAnswers {
  cidade: string;
  animal: string;
  materia: string;
  objeto: string;
  verbo: string;
}

export interface StopRoundState {
  letter: string;
  roundNumber: number;
  totalRounds: number;
  stoppedBy?: string;
  stoppedByName?: string;
  stopCountdownEnd?: number;
  playerAnswers: Record<string, StopCategoryAnswers>;
  roundScores: Record<string, number>;
  isReviewing: boolean;
}

export interface ReflexRoundState {
  targetColor: string;
  targetShape: string;
  targetSymbol: string;
  roundNumber: number;
  totalRounds: number;
  roundStartTime: number;
  fastestPlayerId?: string;
}

export interface ChessGameState {
  fen: string;
  turn: 'w' | 'b';
  history: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  capturedByWhite: string[];
  capturedByBlack: string[];
  whitePlayerId: string;
  blackPlayerId: string;
}

export interface MultiplayerRoom {
  code: string;
  grade: GradeLevel;
  gameType: GameRoomType;
  subject?: SubjectId | 'all';
  subjectName?: string;
  status: 'waiting' | 'in_progress' | 'tiebreaker' | 'finished';
  hostId: string;
  players: MultiplayerPlayer[];
  questions: Question[];
  tiebreakerQuestions: Question[];
  currentQuestionIndex: number;
  maxPlayers: number;
  createdAt: number;
  winnerId?: string;
  chessState?: ChessGameState;
  stopState?: StopRoundState;
  reflexState?: ReflexRoundState;
  recentReactions?: { id: string; playerId: string; playerName: string; emoji: string; timestamp: number }[];
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

export interface StudyReminder {
  id: string;
  subjectId: SubjectId | 'all';
  subjectName: string;
  time: string; // "HH:MM" 24h format, e.g. "14:30"
  daysOfWeek: DayOfWeek[];
  enabled: boolean;
  notes?: string;
  soundAlert?: boolean;
  voiceAlert?: boolean;
  advanceNoticeMinutes?: number; // e.g. 5, 10, 15 minutes before schedule starts
}

export type FocusTechnique = 'pomodoro' | 'deep_work' | 'quick_sprint';

export interface FocusSessionReminder {
  id: string;
  title: string;
  durationMinutes: number;
  breakMinutes: number;
  time: string; // "HH:MM"
  daysOfWeek: DayOfWeek[];
  enabled: boolean;
  subjectId?: SubjectId | 'all' | string;
  subjectName?: string;
  soundAlert: boolean;
  voiceAlert: boolean;
  technique: FocusTechnique;
  createdAt: number;
}

export type ReminderHistoryStatus = 'attended' | 'dismissed';

export interface ReminderHistoryEntry {
  id: string;
  reminderId?: string;
  subjectId: SubjectId | 'all' | string;
  subjectName: string;
  time: string; // e.g. "14:00"
  timestamp: number;
  dateFormatted: string; // e.g. "Hoje às 14:00" ou "23/08/2026, 14:00"
  notes?: string;
  status: ReminderHistoryStatus; // 'attended' = Atendido (Estudou), 'dismissed' = Ignorado
  actionNote?: string;
}

export interface ExamEntry {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  title: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-08-25"
  time?: string; // "HH:MM" e.g. "08:00"
  reminderDayBeforeAtNoon: boolean; // 1 dia antes às 12:00
  reminderOnDayMorning?: boolean; // no dia às 07:00
  topicsCovered?: string;
  notes?: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  grade: GradeLevel;
  topic: string;
  question: string; // Frente do cartão (Pergunta / Conceito)
  answer: string; // Verso do cartão (Resposta / Definição)
  hint?: string; // Dica auxiliar
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string; // e.g. "Fórmula", "Definição", "Vocabulário", "Data"
  isCustom?: boolean;
}

export interface FlashcardDeck {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  grade: GradeLevel;
  icon: string;
  cards: Flashcard[];
  isCustom?: boolean;
  color?: string;
}

export type FriendOnlineStatus = 'online' | 'studying' | 'playing' | 'offline';

export interface FriendUser {
  id: string;
  username: string; // Unique username (e.g. @arthur_estudos)
  name: string; // Display name
  avatar: string;
  grade: GradeLevel;
  status: FriendOnlineStatus;
  statusMessage?: string;
  currentActivity?: string; // e.g. "Estudando Matemática", "No Xadrez", "Jogando Corrida"
  lastSeen?: string;
  totalPoints: number;
  completedChallenges: number;
  streakDays?: number;
  isCustomAdded?: boolean;
}

export interface GameInvitePayload {
  gameType: 'multiplayer' | 'chess' | 'math' | 'puzzle' | 'wordsearch' | 'crossword' | 'times_table' | 'division' | 'languages';
  title: string;
  roomCode?: string;
  subject?: string;
}

export interface GlobalLeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatar: string;
  country: string; // e.g. "🇧🇷 Brasil", "🇵🇹 Portugal", "🇮🇹 Itália", "🇪🇸 Espanha"
  league: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante' | 'Mestre' | 'Grão-Mestre';
  grade: GradeLevel;
  points: number;
  completedChallenges: number;
  streakDays: number;
  isCurrentUser: boolean;
  rank: number;
}


export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string; // Friend ID for 1-on-1
  groupId?: string; // Group ID for group chat
  text?: string;
  audioUrl?: string; // Base64 or Blob URL for recorded voice audio
  audioDuration?: number; // duration in seconds
  imageUrl?: string; // Base64 or Image URL for sent photos/sketches
  gameInvite?: GameInvitePayload;
  timestamp: number;
  read?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  creatorId: string;
  memberIds: string[]; // Friend IDs included in the group
  createdAt: number;
  activeGameCode?: string;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface FriendRequest {
  id: string;
  fromUser: FriendUser;
  toUsername: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
}

export type NoteCategory = 'formula' | 'reminder' | 'concept' | 'question' | 'general';

export interface QuickNoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isPinned?: boolean;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  createdAt: number;
  updatedAt: number;
}

export type GradingPeriodType = 'bimonthly' | 'trimonthly'; // Bimestral (4 bimestres) ou Trimestral (3 trimestres)

export interface SubjectGradeEntry {
  subjectId: string;
  subjectName: string;
  isCustom?: boolean;
  grades: (number | null)[]; // e.g. [8.5, 7.0, 9.0, null]
  targetPassingGrade?: number;
  notes?: string;
}

export interface ReportCardData {
  periodType: GradingPeriodType;
  passingGrade: number; // e.g. 6.0 or 7.0
  subjects: SubjectGradeEntry[];
  lastUpdated: number;
}

// --- PHOTO EXAM CREATOR & ESTIMATED GRADE TYPES ---
export type ExamQuestionType = 'multiple_choice' | 'true_false' | 'discursive' | 'fill_blank';

export interface ExamQuestionItem {
  id: string;
  type: ExamQuestionType;
  question: string;
  topic?: string;
  options?: string[]; // for multiple_choice
  correctOptionIndex?: number;
  correctBoolean?: boolean; // for true_false
  correctAnswerText?: string; // model answer for discursive
  rubricCriteria?: string[]; // criteria for grading discursive
  explanation: string;
  points: number; // e.g. 20 (totals 100)
}

export interface ExamContentSummary {
  title: string;
  detectedSubject?: string;
  overview: string;
  keyConcepts: string[];
  importantRulesOrFormulas?: string[];
  summaryForVoice: string;
}

export interface CustomExam {
  id: string;
  title: string;
  subject: SubjectId | string;
  grade: GradeLevel;
  description?: string;
  extractedTopicSummary?: string;
  contentSummary?: ExamContentSummary;
  questions: ExamQuestionItem[];
  totalPoints: number; // 100 or custom scale
  maxExamValue?: number; // e.g. 10.0, 100, 50, 30
  createdAt: number;
  sourceImages?: string[];
}

export interface GradedQuestionResult {
  questionId: string;
  type: ExamQuestionType;
  question: string;
  userSelectedOption?: number;
  userSelectedBoolean?: boolean;
  userTextAnswer?: string;
  correctOptionIndex?: number;
  correctBoolean?: boolean;
  expectedAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  feedback?: string;
  explanation: string;
}

export interface ExamSubmissionResult {
  examId: string;
  examTitle: string;
  subject: string;
  grade: GradeLevel;
  score: number; // 0 to 100 percentage
  totalPointsPossible: number;
  maxExamValue?: number; // e.g. 10.0, 100, 50, 7.0
  scaledScore?: number; // e.g. 8.5 out of 10.0
  gradeEstimate10: number; // 0.0 to 10.0
  classification: string; // 'Excelente / Domínio Pleno' | 'Bom Desempenho' | 'Regular / Na Média' | 'Abaixo da Medida' | 'Necessita Reforço Urgente'
  gradeEstimateFeedback: string;
  studyAdvice: string;
  strengths: string[];
  improvementAreas: string[];
  gradedResults: GradedQuestionResult[];
  completedAt: number;
}

export interface ExamPracticeReminder {
  id: string;
  subjectId: SubjectId | string;
  subjectName: string;
  examDate?: string; // YYYY-MM-DD
  frequencyDays: number; // e.g. 2 or 3 days
  lastTestDate?: number; // timestamp
  lastEstimatedScore?: number; // 0 - 100
  lastEstimatedGrade10?: number; // 0 - 10
  enabled: boolean;
  createdAt: number;
}


