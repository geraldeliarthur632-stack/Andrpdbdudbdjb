import React, { useState, useEffect, useRef } from 'react';
import { AppMode, DifficultyLevel, GradeLevel, StudyReminder, ExamEntry, UserProfile, BadgeItem, TrophyItem, SubjectId } from './types';
import { GRADE_LABELS, getSubjectsForGrade } from './data/curriculumData';
import { soundEffects } from './services/soundEffects';
import { studyGoalService } from './services/studyGoalService';
import { mistakesTrackerService } from './services/mistakesTrackerService';
import {
  ALL_BADGES,
  ALL_TROPHIES,
  getEarnedBadges,
  getEarnedTrophies,
  getHighestBadge,
  getHighestTrophy,
} from './data/trophiesAndBadges';

// Components
import { PortraitContainer } from './components/PortraitContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { BottomNavBar, MainTab } from './components/BottomNavBar';
import { ProfileView } from './components/ProfileView';
import { ProgressDashboard, calculateAcademicLevel } from './components/ProgressDashboard';
import { StudyTipCard } from './components/StudyTipCard';
import { OnboardingModal } from './components/OnboardingModal';
import { IntroNarratorModal } from './components/IntroNarratorModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { CalendarModal } from './components/CalendarModal';
import { TrophiesAndBadgesModal } from './components/TrophiesAndBadgesModal';
import { UnlockCelebrationModal } from './components/UnlockCelebrationModal';
import { ProgressReportModal } from './components/ProgressReportModal';
import { SettingsModal } from './components/SettingsModal';
import { ReportCardModal } from './components/ReportCardModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MoreAppsModal } from './components/MoreAppsModal';
import { SubjectCustomizationModal } from './components/SubjectCustomizationModal';
import { ErrorFeedbackModal } from './components/ErrorFeedbackModal';
import { DailyLimitNoticeModal } from './components/DailyLimitNoticeModal';
import { FirstTimeTutorialModal } from './components/FirstTimeTutorialModal';
import { FaqModal } from './components/FaqModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseService } from './services/database/firebaseService';
import { dailyTimeLimitService } from './services/dailyTimeLimitService';
import { pwaService } from './services/pwaService';

// Modes
import { CadernoMode } from './components/modes/CadernoMode';
import { JourneyMode } from './components/modes/JourneyMode';
import { AITutorChatMode } from './components/modes/AITutorChatMode';
import { AIExplainerMode } from './components/modes/AIExplainerMode';
import { AIResearcherMode } from './components/modes/AIResearcherMode';
import { PassAndPlayMode } from './components/modes/PassAndPlayMode';
import { MultiplayerMode } from './components/modes/MultiplayerMode';
import { KnowledgeDuelMode } from './components/modes/KnowledgeDuelMode';
import { ChessMode } from './components/modes/ChessMode';
import { MathChallengeMode } from './components/modes/MathChallengeMode';
import { ChallengesHub } from './components/modes/ChallengesHub';
import { WordSearchGame } from './components/modes/WordSearchGame';
import { SlidingPuzzleGame } from './components/modes/SlidingPuzzleGame';
import { MathTimesTableMode } from './components/modes/MathTimesTableMode';
import { LanguageLearningMode } from './components/modes/LanguageLearningMode';
import { AITranslatorMode } from './components/modes/AITranslatorMode';
import { PhotoExamCreatorMode } from './components/modes/PhotoExamCreatorMode';
import { MemoryGameMode } from './components/modes/MemoryGameMode';
import { LightningChallengeMode } from './components/modes/LightningChallengeMode';
import { DominoGameMode } from './components/modes/DominoGameMode';

// Icons
import {
  Rocket,
  FileText,
  BookOpen,
  Trophy,
  Globe,
  Camera,
  ChevronRight,
  Flame,
  Zap,
  Sparkles,
  Layers,
  Swords,
  Timer,
  Calendar,
  GraduationCap,
  Clock,
  Compass,
  Pencil,
  X,
  FileDown,
  Printer,
  AlertCircle,
  Cloud,
  ShieldCheck,
  KeyRound,
  Crown,
  Search,
  Download,
} from 'lucide-react';
import { StudentAvatar } from './components/StudentAvatar';
import { SubjectIcon } from './components/SubjectIcon';

const STORAGE_KEY = 'estudahud_user_profile_v3';

export function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Estudante',
          grade: parsed.grade || '6_fund',
          avatar: parsed.avatar || 'graduation-cap',
          photoURL: parsed.photoURL || undefined,
          isFirstTime: typeof parsed.isFirstTime === 'boolean' ? parsed.isFirstTime : true,
          hasSeenIntro: typeof parsed.hasSeenIntro === 'boolean' ? parsed.hasSeenIntro : false,
          totalPoints: typeof parsed.totalPoints === 'number' && !isNaN(parsed.totalPoints) ? parsed.totalPoints : 0,
          completedChallenges: typeof parsed.completedChallenges === 'number' && !isNaN(parsed.completedChallenges) ? parsed.completedChallenges : 0,
          totalCorrectAnswers: typeof parsed.totalCorrectAnswers === 'number' && !isNaN(parsed.totalCorrectAnswers) ? parsed.totalCorrectAnswers : 0,
          customSubjects: Array.isArray(parsed.customSubjects) ? parsed.customSubjects : undefined,
          hasConfiguredSubjects: typeof parsed.hasConfiguredSubjects === 'boolean' ? parsed.hasConfiguredSubjects : false,
        };
      }
    } catch {}
    return {
      name: 'Estudante',
      grade: '6_fund',
      avatar: 'graduation-cap',
      photoURL: undefined,
      isFirstTime: true,
      hasSeenIntro: false,
      totalPoints: 0,
      completedChallenges: 0,
      totalCorrectAnswers: 0,
    };
  });

  const [streakDays, setStreakDays] = useState<number>(() => studyGoalService.getData().streakDays || 0);

  useEffect(() => {
    const updateStreak = () => {
      setStreakDays(studyGoalService.getData().streakDays || 0);
    };
    updateStreak();
    const interval = setInterval(updateStreak, 2500);
    return () => clearInterval(interval);
  }, []);

  // Ensure daily XP is kept synchronized with total points (fixing desync where 0 points showed stale 70 XP)
  useEffect(() => {
    studyGoalService.syncDailyXpWithTotalPoints(user.totalPoints || 0);
  }, [user.totalPoints]);

  // Escuta autenticação do Firebase e sincroniza com o banco de dados Firestore
  useEffect(() => {
    // Trata retorno de autenticação via redirect do Google (no Android / TWA / mobile)
    FirebaseService.checkRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          console.info('Usuário autenticado via redirect:', redirectUser.email || redirectUser.uid);
        }
      })
      .catch((err) => {
        console.warn('Aviso no checkRedirectResult:', err);
      });

    const unsubscribe = FirebaseService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const cloudData = await FirebaseService.restoreProgress(firebaseUser.uid);
          setUser((prev) => {
            const mergedTotalPoints = Math.max(prev.totalPoints || 0, cloudData?.totalPoints || 0);
            const mergedChallenges = Math.max(prev.completedChallenges || 0, cloudData?.completedChallenges || 0);
            const mergedCorrect = Math.max(prev.totalCorrectAnswers || 0, cloudData?.totalCorrectAnswers || 0);

            const updated: UserProfile = {
              ...prev,
              userId: firebaseUser.uid,
              email: firebaseUser.email || prev.email,
              photoURL: firebaseUser.photoURL || prev.photoURL,
              name: cloudData?.name || firebaseUser.displayName || prev.name,
              grade: (cloudData?.grade as GradeLevel) || prev.grade,
              avatar: cloudData?.avatar || prev.avatar,
              avatarId: cloudData?.avatarId || prev.avatarId,
              totalPoints: mergedTotalPoints,
              completedChallenges: mergedChallenges,
              totalCorrectAnswers: mergedCorrect,
              customSubjects: cloudData?.customSubjects || prev.customSubjects,
              hasConfiguredSubjects: cloudData?.hasConfiguredSubjects ?? prev.hasConfiguredSubjects,
              lastSyncedAt: new Date().toISOString(),
            };

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}

            return updated;
          });
        } catch (err) {
          console.warn('Aviso ao sincronizar dados do usuário no banco:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sincronização automática em background com o banco de dados sempre que o usuário evoluir
  useEffect(() => {
    if (!user.userId || user.userId.startsWith('guest_')) return;
    const authUser = FirebaseService.getCurrentUser();
    if (!authUser || authUser.uid !== user.userId) return;

    const timeout = setTimeout(() => {
      FirebaseService.syncProgress(user.userId!, {
        name: user.name,
        grade: user.grade,
        avatar: user.avatar,
        avatarId: user.avatarId,
        totalPoints: user.totalPoints,
        completedChallenges: user.completedChallenges,
        totalCorrectAnswers: user.totalCorrectAnswers,
        email: user.email,
        customSubjects: user.customSubjects,
        hasConfiguredSubjects: user.hasConfiguredSubjects,
      }).catch((err) => console.warn('Aviso de auto-sync com Firestore:', err));
    }, 1500);

    return () => clearTimeout(timeout);
  }, [user.totalPoints, user.completedChallenges, user.totalCorrectAnswers, user.name, user.grade, user.avatar, user.avatarId, user.userId]);

  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const [currentMode, setCurrentMode] = useState<
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
    | 'lightning'
    | 'domino'
  >('tabs');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFirstTimeTutorialOpen, setIsFirstTimeTutorialOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isProgressReportOpen, setIsProgressReportOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isMoreAppsOpen, setIsMoreAppsOpen] = useState(false);
  const [isSubjectCustomizationOpen, setIsSubjectCustomizationOpen] = useState(false);
  const [showTutorialAfterSubjects, setShowTutorialAfterSubjects] = useState(false);
  const [isErrorFeedbackOpen, setIsErrorFeedbackOpen] = useState(false);
  const [errorFeedbackTopic, setErrorFeedbackTopic] = useState<string | undefined>(undefined);

  // Pós-login com e-mail/senha ou convidado: abre a tela das 3 matérias (Biologia, Física, Química) e depois a de explicação
  const handleAuthLoginSuccess = () => {
    setIsAuthModalOpen(false);
    setShowTutorialAfterSubjects(true);
    setIsSubjectCustomizationOpen(true);
  };

  // Retorno direto para a tela principal (sem anúncios) com scroll reset e retorno garantido à aba Início
  const handleExitTask = () => {
    try {
      soundEffects.playClick();
    } catch {}
    setJourneyInitialSubject(undefined);
    setActiveTab('home');
    setCurrentMode('tabs');
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      const mainScroll = document.getElementById('main-scroll-view');
      if (mainScroll) {
        mainScroll.scrollTop = 0;
        mainScroll.scrollTo({ top: 0, behavior: 'auto' });
      }
      requestAnimationFrame(() => {
        try {
          const scrollEl = document.getElementById('main-scroll-view');
          if (scrollEl) {
            scrollEl.scrollTop = 0;
          }
        } catch {}
      });
    } catch (e) {
      console.warn('Aviso de reset de scroll:', e);
    }
  };

  // Garante scroll no topo ao transitar de modos/abas, eliminando telas brancas por scroll residual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    const mainScroll = document.getElementById('main-scroll-view');
    if (mainScroll) {
      mainScroll.scrollTop = 0;
    }
  }, [currentMode, activeTab]);

  // Daily study time limit (2 hours / day)
  const [dailyStudySeconds, setDailyStudySeconds] = useState<number>(() =>
    dailyTimeLimitService.getTodaySeconds()
  );
  const [isDailyLimitModalOpen, setIsDailyLimitModalOpen] = useState(false);

  // Monitor active study time every second when tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const next = dailyTimeLimitService.addSeconds(1);
        setDailyStudySeconds(next);

        if (dailyTimeLimitService.shouldShowNotice()) {
          setIsDailyLimitModalOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Trophies & Badges modal state
  const [isTrophiesModalOpen, setIsTrophiesModalOpen] = useState(false);
  const [trophiesModalDefaultTab, setTrophiesModalDefaultTab] = useState<'trophies' | 'badges'>('trophies');
  const [unlockedCelebrationItem, setUnlockedCelebrationItem] = useState<{
    type: 'trophy' | 'badge';
    item: TrophyItem | BadgeItem;
  } | null>(null);

  // Suporte nativo ao Botão Voltar do Android (TWA / PWA / Dispositivos Móveis)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.history) {
        if (!window.history.state || !window.history.state.trilhadosaber) {
          window.history.replaceState({ trilhadosaber: true, depth: 0 }, '');
          window.history.pushState({ trilhadosaber: true, depth: 1 }, '');
        }
      }
    } catch {}

    const handlePopState = () => {
      try {
        window.history.pushState({ trilhadosaber: true, depth: 1 }, '');
      } catch {}

      // 1. Se houver modal aberto, fecha o modal ativo em vez de fechar o app
      if (isAuthModalOpen) { setIsAuthModalOpen(false); return; }
      if (isSettingsOpen) { setIsSettingsOpen(false); return; }
      if (isProfileEditOpen) { setIsProfileEditOpen(false); return; }
      if (isCalendarOpen) { setIsCalendarOpen(false); return; }
      if (isTrophiesModalOpen) { setIsTrophiesModalOpen(false); return; }
      if (isProgressReportOpen) { setIsProgressReportOpen(false); return; }
      if (isReportCardOpen) { setIsReportCardOpen(false); return; }
      if (isSubjectCustomizationOpen) { setIsSubjectCustomizationOpen(false); return; }
      if (isErrorFeedbackOpen) { setIsErrorFeedbackOpen(false); return; }
      if (isMoreAppsOpen) { setIsMoreAppsOpen(false); return; }
      if (isFaqOpen) { setIsFaqOpen(false); return; }
      if (isFirstTimeTutorialOpen) { setIsFirstTimeTutorialOpen(false); return; }
      if (isOnboardingOpen) { setIsOnboardingOpen(false); return; }
      if (isIntroOpen) { setIsIntroOpen(false); return; }
      if (isDailyLimitModalOpen) { setIsDailyLimitModalOpen(false); return; }
      if (unlockedCelebrationItem) { setUnlockedCelebrationItem(null); return; }

      // 2. Se estiver em algum modo de estudo/jogo/desafio, retorna para as abas principais
      if (currentMode !== 'tabs') {
        handleExitTask();
        return;
      }

      // 3. Se estiver em uma aba secundária, retorna para a aba Início
      if (activeTab !== 'home') {
        setActiveTab('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isAuthModalOpen,
    isSettingsOpen,
    isProfileEditOpen,
    isCalendarOpen,
    isTrophiesModalOpen,
    isProgressReportOpen,
    isReportCardOpen,
    isSubjectCustomizationOpen,
    isErrorFeedbackOpen,
    isMoreAppsOpen,
    isFaqOpen,
    isFirstTimeTutorialOpen,
    isOnboardingOpen,
    isIntroOpen,
    isDailyLimitModalOpen,
    unlockedCelebrationItem,
    currentMode,
    activeTab,
  ]);

  // Sound Settings
  const [isMuted, setIsMuted] = useState(false);

  // App Theme State (Always Light mode as strictly requested by user: fixed to light theme)
  const appTheme: 'light' = 'light';
  const isLight = true;

  // Enforce light theme in localStorage on initial mount and ensure DOM classes
  useEffect(() => {
    try {
      localStorage.setItem('estudahud_app_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light', 'theme-light');
    } catch {}
  }, []);

  const toggleTheme = () => {
    // Disabled: App is permanently fixed in 100% Light Theme
  };

  // Selected subject when starting a session directly from a study reminder card
  const [journeyInitialSubject, setJourneyInitialSubject] = useState<SubjectId | undefined>(undefined);

  // Suggested subject for "Continuar estudando" based on highest difficulty and accumulated correct answers
  const [continueSubjectId, setContinueSubjectId] = useState<string | null>(null);
  const [difficultySuggestionIndex, setDifficultySuggestionIndex] = useState<number>(-1);
  const [subjectSuggestionInfo, setSubjectSuggestionInfo] = useState<{
    subjectId: string;
    subjectName: string;
    icon: string;
    reason: string;
    badgeLabel: string;
    accuracyPercent: number;
    correctCount: number;
    totalAttempts: number;
  } | null>(null);

  const handleStartStudySession = (subjectId: SubjectId) => {
    soundEffects.playClick();
    setJourneyInitialSubject(subjectId);
    setCurrentMode('journey');
  };

  const handleSuggestSubjectByDifficulty = () => {
    soundEffects.playClick();
    const allSubs = getSubjectsForGrade(user.grade, user.customSubjects);

    if (allSubs.length === 0) return;

    // Rank subjects by difficulty based on accumulated correct answers and error stats
    const ranked = mistakesTrackerService.getDifficultyRankedSubjects(user.grade, allSubs);
    if (ranked.length === 0) return;

    const nextIdx = (difficultySuggestionIndex + 1) % ranked.length;
    setDifficultySuggestionIndex(nextIdx);

    const chosen = ranked[nextIdx];
    setContinueSubjectId(chosen.subjectId);
    setSubjectSuggestionInfo({
      subjectId: chosen.subjectId,
      subjectName: chosen.subjectName,
      icon: chosen.icon,
      reason: chosen.reason,
      badgeLabel: chosen.badgeLabel,
      accuracyPercent: chosen.accuracyPercent,
      correctCount: chosen.correctCount,
      totalAttempts: chosen.totalAttempts,
    });

    soundEffects.playSuccess();
  };

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  // First time user detection and automatic onboarding & tutorial flow
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const tutorialDone = localStorage.getItem('trilha_saber_first_time_tutorial_done') === 'true';
      if (!stored || user.isFirstTime) {
        setIsOnboardingOpen(true);
      } else if (!tutorialDone) {
        setIsFirstTimeTutorialOpen(true);
      }
    } catch {}
  }, []);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const levelInfo = calculateAcademicLevel(user.totalPoints || 0);

  const handleUpdateProfile = (updatedProfile: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedProfile, isFirstTime: false };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleEarnPoints = (
    earnedPoints: number,
    isMajorChallenge: boolean = false,
    questionsCount: number = 1
  ) => {
    setUser((prev) => {
      const newPoints = (prev.totalPoints || 0) + earnedPoints;
      const newCorrect = (prev.totalCorrectAnswers || 0) + questionsCount;
      const newChallenges = isMajorChallenge
        ? (prev.completedChallenges || 0) + 1
        : prev.completedChallenges || 0;

      return {
        ...prev,
        totalPoints: newPoints,
        totalCorrectAnswers: newCorrect,
        completedChallenges: newChallenges,
      };
    });
  };

  const handleOpenTrophiesAndBadges = (tab: 'trophies' | 'badges' = 'trophies') => {
    soundEffects.playClick();
    setTrophiesModalDefaultTab(tab);
    setIsTrophiesModalOpen(true);
  };

  const handleInstallAppClick = async () => {
    soundEffects.playClick();
    if (pwaService.hasNativePrompt()) {
      const outcome = await pwaService.promptNativeInstall();
      if (outcome === 'accepted') {
        soundEffects.playVictoryFanfare();
        return;
      }
      if (outcome === 'dismissed') {
        return;
      }
    }
    setIsInstallAppOpen(true);
  };

  return (
    <PortraitContainer themeClass={appTheme === 'light' ? 'theme-light' : 'theme-dark'}>
      <div className="flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden relative">
        {/* Dynamic Header */}
        {currentMode === 'tabs' && (
          <Header
            user={user}
            theme={appTheme}
            onToggleTheme={toggleTheme}
            onGoHome={() => {
              setActiveTab('home');
              const mainScroll = document.getElementById('main-scroll-view');
              if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onEditProfile={() => setIsProfileEditOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
            onOpenInstallApp={handleInstallAppClick}
            onOpenFaq={() => setIsFaqOpen(true)}
            onOpenAppExplanation={() => setIsFirstTimeTutorialOpen(true)}
            onOpenErrorFeedback={(topic) => {
              setErrorFeedbackTopic(topic);
              setIsErrorFeedbackOpen(true);
            }}
          />
        )}

        {/* Main App Content View - Scrolls independently while Header and BottomNavBar remain fixed */}
        <main
          id="main-scroll-view"
          className={`flex-1 flex flex-col min-h-0 overflow-y-auto relative scrollbar-thin ${
            isLight
              ? 'bg-slate-50 text-slate-900 scrollbar-thumb-slate-300'
              : 'bg-[#0b0f19] text-white scrollbar-thumb-slate-800'
          } landscape-scroll-container`}
        >
          <ErrorBoundary onReset={handleExitTask}>
          {/* ===================== TAB 1: INÍCIO (HOME) ===================== */}
          {currentMode === 'tabs' && activeTab === 'home' && (
            <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 space-y-4 max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full pb-24 sm:pb-28">
            {/* Student Greeting & Profile Avatar with edit pencil in the corner */}
            <div className={`flex items-center justify-between gap-3 p-3.5 rounded-3xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829]/60 border-[#273553]'
            }`}>
              <div className="space-y-0.5 min-w-0">
                <h1 className={`text-lg sm:text-2xl font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {getGreeting()}, {user.name || 'Estudante'}!
                </h1>
                <p className={`text-xs sm:text-sm font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {GRADE_LABELS[user.grade]?.full || 'Ensino Fundamental'} • Pronto para aprender hoje?
                </p>
              </div>

              {/* Foto de Perfil do Estudante com Lapizinho no Canto */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsProfileEditOpen(true);
                  }}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-0.5 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  title="Editar perfil e foto/avatar"
                  aria-label="Editar perfil e avatar"
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center select-none transition overflow-hidden ${
                    isLight ? 'bg-white group-hover:bg-slate-100' : 'bg-[#0b0f19] group-hover:bg-[#121829]'
                  }`}>
                    <StudentAvatar
                      photoURL={user.photoURL}
                      className="w-full h-full"
                      iconClassName="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600"
                      alt={user.name || 'Estudante'}
                    />
                  </div>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsProfileEditOpen(true);
                  }}
                  className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#8b5cf6] hover:bg-[#a855f7] text-white flex items-center justify-center shadow-md border-2 transition-transform hover:scale-110 active:scale-90 cursor-pointer ${
                    isLight ? 'border-white' : 'border-[#121829]'
                  }`}
                  title="Editar perfil"
                  aria-label="Editar perfil"
                >
                  <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            {/* Responsive 2-Column Grid on Tablet/Desktop/Landscape */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Level & Progress */}
              <div className="space-y-3.5">
                {/* Level Card */}
                <div className={`rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden border ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
                }`}>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Nível {levelInfo.level}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          : 'text-[#c084fc] bg-[#8b5cf6]/20 border-[#8b5cf6]/40'
                      }`}>
                        {levelInfo.title}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1e293b]'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#c084fc] transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                        style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
                      />
                    </div>

                    <div className={`flex items-center justify-between text-[11px] sm:text-xs font-bold ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span>{levelInfo.currentPointsInLevel} / {levelInfo.pointsNeededForNextLevel} XP</span>
                      <span>Próximo: {levelInfo.nextTitle}</span>
                    </div>
                  </div>

                  {/* Glowing Level Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#7c3aed] to-[#a855f7] p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0">
                    <div className={`w-full h-full rounded-2xl flex items-center justify-center text-2xl ${
                      isLight ? 'bg-white' : 'bg-[#121829]'
                    }`}>
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Pontos XP Card */}
                <div
                  style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#e2e8f0' }}
                  className="p-3.5 sm:p-4 rounded-3xl space-y-1 shadow-sm border border-slate-200 force-white-bg force-black-text"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold force-black-text" style={{ color: '#000000' }}>
                    <Trophy className="w-3.5 h-3.5 text-black" />
                    <span style={{ color: '#000000' }} className="force-black-text font-bold">Pontos Acumulados</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span style={{ color: '#000000' }} className="text-2xl sm:text-3xl font-black force-black-text">
                      {(user.totalPoints || 0).toLocaleString('pt-BR')}
                    </span>
                    <span style={{ color: '#000000' }} className="text-xs font-semibold force-black-text">XP</span>
                  </div>
                </div>

                {/* "Continuar estudando" Card */}
                {(() => {
                  const allSubs = getSubjectsForGrade(user.grade, user.customSubjects);

                  // If user selected a suggestion or clicked "Nova Matéria", use that subject, otherwise default to first
                  const activeSub =
                    allSubs.find((s) => s.id === continueSubjectId) ||
                    allSubs[0] ||
                    { id: 'matematica', name: 'Matemática', icon: '📐' };

                  const completedList = studyGoalService.getCompletedSubjects(user.grade);
                  const progressPerc = Math.min(100, Math.round((completedList.length / Math.max(1, allSubs.length)) * 100));

                  const isSuggested = subjectSuggestionInfo && subjectSuggestionInfo.subjectId === activeSub.id;

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 p-1 rounded-2xl force-white-bg" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                        <h3 className="text-sm font-black truncate force-black-text" style={{ color: '#0f172a' }}>
                          Continuar estudando
                        </h3>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Botão "Nova Matéria" sugerida com base em dificuldade e acertos acumulados */}
                          <button
                            type="button"
                            onClick={handleSuggestSubjectByDifficulty}
                            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer border border-slate-300 force-white-btn hover:bg-slate-100 force-black-text"
                            title="Sugerir matéria baseada nas suas maiores dificuldades usando dados de acertos acumulados"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="font-bold force-black-text" style={{ color: '#0f172a' }}>Nova Matéria</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setCurrentMode('journey');
                            }}
                            style={{ color: '#0f172a' }}
                            className="text-xs font-bold transition cursor-pointer px-2 py-1 rounded-xl hover:bg-slate-100 force-black-text"
                          >
                            Ver tudo
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleStartStudySession(activeSub.id as SubjectId);
                        }}
                        style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                        className="w-full p-4 rounded-3xl border border-slate-200 transition flex items-center gap-3.5 text-left active:scale-[0.99] group cursor-pointer force-white-bg shadow-xs hover:border-slate-400 force-black-text"
                      >
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 font-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform force-black-text" style={{ color: '#0f172a' }}>
                            <SubjectIcon subjectId={activeSub.id} className="w-6 h-6 text-slate-800" />
                          </div>
                          {isSuggested && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-700"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black truncate force-black-text" style={{ color: '#0f172a' }}>
                              {activeSub.name}
                            </span>
                            {isSuggested && (
                              <span style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#334155' }} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0">
                                {subjectSuggestionInfo.badgeLabel}
                              </span>
                            )}
                          </div>

                          <p className="text-xs truncate font-medium" style={{ color: '#475569' }}>
                            {isSuggested ? (
                              <span className="font-medium" style={{ color: '#475569' }}>
                                {subjectSuggestionInfo.reason}
                              </span>
                            ) : (
                              `${GRADE_LABELS[user.grade]?.short || '6º Ano'} • BNCC`
                            )}
                          </p>

                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: '#475569' }}>
                              <span style={{ color: '#475569' }}>
                                {completedList.length}/{allSubs.length} matérias concluídas ({progressPerc}%)
                              </span>
                              <span className="font-black force-black-text flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform" style={{ color: '#0f172a' }}>
                                Iniciar agora →
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-900"
                                style={{ width: `${Math.max(4, progressPerc)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: 9 Core Study Modes Grid & Special Highlights */}
              <div className="space-y-3.5">
                {/* 9 Core Study Features (Grid 3x3) */}
                <div className="space-y-2.5">
                  <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Ferramentas de Estudo</h3>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {/* 1. Jornada */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('journey');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Jornada
                      </span>
                    </button>

                    {/* 2. Caderno */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('caderno');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Caderno
                      </span>
                    </button>

                    {/* 3. Calendário de Provas */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsCalendarOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Calendário
                      </span>
                    </button>

                    {/* 4. Boletim Escolar */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsReportCardOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Boletim
                      </span>
                    </button>

                    {/* 5. Idiomas */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('languages');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Idiomas
                      </span>
                    </button>

                    {/* 6. Xadrez */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('chess');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Xadrez
                      </span>
                    </button>

                    {/* 7. Erros & Feedback */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsErrorFeedbackOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-rose-500/60 hover:bg-[#161e31]'
                      }`}
                      title="Central de Erros & Feedback"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-rose-600 group-hover:text-rose-700' : 'text-rose-300 group-hover:text-white'}`}>
                        Erros
                      </span>
                    </button>

                    {/* 8. Desafio Relâmpago (60s) */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('lightning');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer relative ${
                        isLight
                          ? 'bg-white border-amber-300 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs'
                          : 'bg-[#121829] border-amber-500/40 hover:border-amber-400 hover:bg-[#161e31]'
                      }`}
                      title="Desafio Relâmpago (60 Segundos)"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-amber-700 group-hover:text-amber-800' : 'text-amber-300 group-hover:text-white'}`}>
                        Relâmpago
                      </span>
                    </button>

                    {/* 9. Duelo 1v1 */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('duel');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-violet-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-violet-500/60 hover:bg-[#161e31]'
                      }`}
                      title="Duelo do Conhecimento 1v1"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-violet-700 group-hover:text-violet-900' : 'text-violet-300 group-hover:text-white'}`}>
                        Duelo 1v1
                      </span>
                    </button>
                  </div>
                </div>

                {/* Explicador, Pesquisador, Tradutor & Criar Prova */}
                <div className="space-y-2 pt-1">

                  {/* Tradutor (Texto & Foto) */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('translator');
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-cyan-500 text-white flex items-center justify-between transition shadow-lg shadow-cyan-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white block">Tradutor (Texto & Foto)</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                            Novo
                          </span>
                        </div>
                        <p className="text-xs text-white/80">Traduza textos, fotos de livros & ouça a pronúncia em 12 línguas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Explicador */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('explainer');
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-between transition shadow-lg shadow-purple-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-white block">Explicador (Foto & Temas)</span>
                        <p className="text-xs text-white/80">Tire foto do tema, caderno ou trabalho & receba a explicação completa</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Pesquisador */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('researcher');
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-between transition shadow-lg shadow-cyan-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-white block">Pesquisador (Trabalhos & Projetos)</span>
                        <p className="text-xs text-white/80">Digite para pesquisar temas e receba o trabalho completo</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Criar Prova por Foto */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('photo_exam');
                    }}
                    className={`w-full p-4 rounded-3xl border flex items-center justify-between transition active:scale-[0.99] group cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 shadow-xs'
                        : 'bg-[#121829] border-[#273553] hover:border-blue-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isLight
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className={`text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>Criar Prova por Foto</span>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tire foto do caderno ou livro e gere provas completas com nota</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition shrink-0 ${isLight ? 'text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1' : 'text-slate-500 group-hover:text-white group-hover:translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: EXPLORAR ===================== */}
        {currentMode === 'tabs' && activeTab === 'explore' && (
          <ChallengesHub
            user={user}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onOpenMoreApps={() => setIsMoreAppsOpen(true)}
            theme={appTheme}
            onSelectChallenge={(mode) => {
              soundEffects.playClick();
              setCurrentMode(mode as any);
            }}
          />
        )}

        {/* ===================== TAB 3: PROGRESSO ===================== */}
        {currentMode === 'tabs' && activeTab === 'progress' && (
          <ProgressDashboard
            totalPoints={user.totalPoints || 0}
            completedChallenges={user.completedChallenges || 0}
            totalCorrectAnswers={user.totalCorrectAnswers || 0}
            userGrade={user.grade}
            userName={user.name}
            theme={appTheme}
            customSubjects={user.customSubjects}
            onStartSession={handleStartStudySession}
            onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onPracticeTopic={(_topic, _subjectId) => {
              soundEffects.playClick();
              setCurrentMode('journey');
            }}
          />
        )}

        {/* ===================== TAB 4: PERFIL ===================== */}
        {currentMode === 'tabs' && activeTab === 'profile' && (
          <ProfileView
            user={user}
            theme={appTheme}
            onToggleTheme={toggleTheme}
            onEditProfile={() => setIsProfileEditOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenInstallApp={handleInstallAppClick}
            onOpenSubjectCustomization={() => setIsSubjectCustomizationOpen(true)}
            onOpenFaq={() => setIsFaqOpen(true)}
            onOpenAppExplanation={() => setIsFirstTimeTutorialOpen(true)}
            onOpenErrorFeedback={() => {
              setErrorFeedbackTopic(undefined);
              setIsErrorFeedbackOpen(true);
            }}
            onSelectAvatar={(avatar) => handleUpdateProfile({ avatar: avatar.emoji, avatarId: avatar.id })}
          />
        )}

        {/* ===================== INDIVIDUAL MODES SCREENS ===================== */}
        {currentMode === 'journey' && (
          <JourneyMode
            user={user}
            initialSubjectId={journeyInitialSubject}
            onBack={handleExitTask}
            onAnswerCorrect={() => handleEarnPoints(15, false, 1)}
            onFinishLesson={(count) => {
              handleEarnPoints(50, true, count);
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
            onOpenSubjectCustomization={() => setIsSubjectCustomizationOpen(true)}
            onOpenErrorFeedback={(topic) => {
              setErrorFeedbackTopic(topic);
              setIsErrorFeedbackOpen(true);
            }}
          />
        )}

        {currentMode === 'explainer' && (
          <AIExplainerMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'researcher' && (
          <AIResearcherMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'custom' && (
          <AIExplainerMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'caderno' && (
          <CadernoMode
            user={user}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, true, 1)}
            onOpenChessBoard={() => {
              soundEffects.playClick();
              setCurrentMode('chess');
            }}
          />
        )}

        {currentMode === 'languages' && (
          <LanguageLearningMode
            onBack={handleExitTask}
            onAddScore={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'translator' && (
          <AITranslatorMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'photo_exam' && (
          <PhotoExamCreatorMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'chess' && (
          <ChessMode
            user={user}
            onBack={handleExitTask}
            onEarnPoints={(pts) => handleEarnPoints(pts, true, 1)}
          />
        )}

        {currentMode === 'math' && (
          <MathChallengeMode
            user={user}
            difficulty={selectedDifficulty}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'times_table' && (
          <MathTimesTableMode
            onBack={handleExitTask}
            onAddScore={(pts) => handleEarnPoints(pts, true, 1)}
          />
        )}

        {currentMode === 'wordsearch' && (
          <WordSearchGame
            grade={user.grade}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'puzzle' && (
          <SlidingPuzzleGame
            grade={user.grade}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'duel' && (
          <KnowledgeDuelMode
            user={user}
            theme={appTheme}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'competition' && (
          <PassAndPlayMode
            user={user}
            onBack={handleExitTask}
            onAnswerCorrect={() => handleEarnPoints(10, false, 1)}
            onMatchFinished={(winnerIsUser) => {
              handleEarnPoints(winnerIsUser ? 50 : 20, true, 0);
              handleExitTask();
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'multiplayer' && (
          <MultiplayerMode
            user={user}
            onBack={handleExitTask}
            onAnswerCorrect={() => handleEarnPoints(10, false, 1)}
            onMatchFinished={(winnerIsUser) => {
              handleEarnPoints(winnerIsUser ? 50 : 20, true, 0);
              handleExitTask();
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'memory' && (
          <MemoryGameMode
            user={user}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'lightning' && (
          <LightningChallengeMode
            user={user}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'domino' && (
          <DominoGameMode
            user={user}
            onBack={handleExitTask}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
            theme={appTheme}
          />
        )}
          </ErrorBoundary>
      </main>

      {/* Persistent Bottom Bar (Visible when on Tabs) */}
      {currentMode === 'tabs' && (
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          theme={appTheme}
        />
      )}
      </div>

      {/* ALL MODALS */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        user={user}
        onUpdateUser={(updated) => {
          handleUpdateProfile(updated);
        }}
        onSaveProfile={(profile) => {
          handleUpdateProfile(profile);
          setIsOnboardingOpen(false);
          setIsFirstTimeTutorialOpen(true);
        }}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setIsFirstTimeTutorialOpen(true);
        }}
        onClose={() => {
          setIsOnboardingOpen(false);
        }}
        onOpenAuth={() => {
          setIsOnboardingOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <FirstTimeTutorialModal
        isOpen={isFirstTimeTutorialOpen}
        userName={user.name}
        onComplete={() => {
          try {
            localStorage.setItem('trilha_saber_first_time_tutorial_done', 'true');
          } catch {}
          setIsFirstTimeTutorialOpen(false);
        }}
        onClose={() => {
          try {
            localStorage.setItem('trilha_saber_first_time_tutorial_done', 'true');
          } catch {}
          setIsFirstTimeTutorialOpen(false);
        }}
        onOpenFaq={() => setIsFaqOpen(true)}
      />

      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        onOpenTutorial={() => {
          setIsFaqOpen(false);
          setIsFirstTimeTutorialOpen(true);
        }}
        onOpenErrorFeedback={() => {
          setIsFaqOpen(false);
          setErrorFeedbackTopic(undefined);
          setIsErrorFeedbackOpen(true);
        }}
      />

      <IntroNarratorModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        onComplete={() => setIsIntroOpen(false)}
        onOpenFaq={() => setIsFaqOpen(true)}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        user={user}
        onClose={() => setIsProfileEditOpen(false)}
        onSaveProfile={handleUpdateProfile}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        theme={appTheme}
        onToggleTheme={toggleTheme}
        onOpenProfileEdit={() => {
          setIsSettingsOpen(false);
          setIsProfileEditOpen(true);
        }}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthModalOpen(true);
        }}
        onOpenCalendar={() => {
          setIsSettingsOpen(false);
          setIsCalendarOpen(true);
        }}
        onOpenReportCard={() => {
          setIsSettingsOpen(false);
          setIsReportCardOpen(true);
        }}
        onOpenInstallApp={() => {
          setIsSettingsOpen(false);
          handleInstallAppClick();
        }}
        onOpenSubjectCustomization={() => {
          setIsSettingsOpen(false);
          setIsSubjectCustomizationOpen(true);
        }}
        onOpenFaq={() => {
          setIsSettingsOpen(false);
          setIsFaqOpen(true);
        }}
        onOpenAppExplanation={() => {
          setIsSettingsOpen(false);
          setIsFirstTimeTutorialOpen(true);
        }}
        onOpenErrorFeedback={() => {
          setIsSettingsOpen(false);
          setErrorFeedbackTopic(undefined);
          setIsErrorFeedbackOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onLogout={async () => {
          // Garante sincronização final com o banco de dados antes de desconectar para que nada seja perdido
          const currentAuthUser = FirebaseService.getCurrentUser();
          if (user.userId && !user.userId.startsWith('guest_') && currentAuthUser?.uid === user.userId) {
            try {
              await FirebaseService.syncProgress(user.userId, {
                name: user.name,
                grade: user.grade,
                avatar: user.avatar,
                avatarId: user.avatarId,
                totalPoints: user.totalPoints,
                completedChallenges: user.completedChallenges,
                totalCorrectAnswers: user.totalCorrectAnswers,
                email: user.email,
                customSubjects: user.customSubjects,
                hasConfiguredSubjects: user.hasConfiguredSubjects,
              });
            } catch (syncErr) {
              console.warn('Aviso ao sincronizar antes de sair:', syncErr);
            }
          }
          try {
            await FirebaseService.logout();
          } catch {}
          handleUpdateProfile({
            userId: undefined,
            email: undefined,
            photoURL: undefined,
            isFirstTime: true,
          });
          setIsSettingsOpen(false);
          setIsAuthModalOpen(false);
          setCurrentMode('tabs');
          setActiveTab('home');
          setIsOnboardingOpen(true);
          const mainScroll = document.getElementById('main-scroll-view');
          if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateProfile}
        onLoginSuccess={handleAuthLoginSuccess}
        onLogoutSuccess={() => {
          handleUpdateProfile({
            userId: undefined,
            email: undefined,
            photoURL: undefined,
            isFirstTime: true,
          });
          setIsAuthModalOpen(false);
          setIsSettingsOpen(false);
          setCurrentMode('tabs');
          setActiveTab('home');
          setIsOnboardingOpen(true);
          const mainScroll = document.getElementById('main-scroll-view');
          if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        userGrade={user.grade}
        onClose={() => setIsCalendarOpen(false)}
      />

      <TrophiesAndBadgesModal
        isOpen={isTrophiesModalOpen}
        onClose={() => setIsTrophiesModalOpen(false)}
        user={user}
        defaultTab={trophiesModalDefaultTab}
      />

      <ProgressReportModal
        isOpen={isProgressReportOpen}
        onClose={() => setIsProgressReportOpen(false)}
        user={user}
      />

      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        user={user}
      />

      <UnlockCelebrationModal
        unlockedItem={unlockedCelebrationItem}
        onClose={() => setUnlockedCelebrationItem(null)}
        onOpenCollection={() => {
          setIsTrophiesModalOpen(true);
        }}
      />

      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />

      <MoreAppsModal
        isOpen={isMoreAppsOpen}
        onClose={() => setIsMoreAppsOpen(false)}
        theme={appTheme}
      />

      {/* Matérias da Minha Escola (Biologia, Física, Química, Espanhol...) */}
      <SubjectCustomizationModal
        isOpen={isSubjectCustomizationOpen}
        isFirstSetup={showTutorialAfterSubjects}
        onClose={() => {
          setIsSubjectCustomizationOpen(false);
          if (showTutorialAfterSubjects) {
            setShowTutorialAfterSubjects(false);
            setIsFirstTimeTutorialOpen(true);
          }
        }}
        user={user}
        onSaveSubjects={(subjects) => {
          handleUpdateProfile({
            customSubjects: subjects,
            hasConfiguredSubjects: true,
          });
        }}
      />

      {/* Central de Erros e Feedback dos Estudantes */}
      <ErrorFeedbackModal
        isOpen={isErrorFeedbackOpen}
        onClose={() => {
          setIsErrorFeedbackOpen(false);
          setErrorFeedbackTopic(undefined);
        }}
        user={user}
        initialTopicContext={errorFeedbackTopic}
      />

      {/* Aviso de Limite Diário Recomendado de 2 Horas */}
      <DailyLimitNoticeModal
        isOpen={isDailyLimitModalOpen}
        onClose={() => setIsDailyLimitModalOpen(false)}
        onSnooze={(minutes) => {
          dailyTimeLimitService.snoozeNotice(minutes || 15);
          setIsDailyLimitModalOpen(false);
        }}
        todaySeconds={dailyStudySeconds}
      />
    </PortraitContainer>
  );
}

export default App;
