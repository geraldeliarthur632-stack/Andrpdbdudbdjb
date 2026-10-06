import React, { useState, useEffect } from 'react';
import { UserProfile, GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { FirebaseService } from '../services/database/firebaseService';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  CheckCircle2,
  User,
  LogOut,
  Sparkles,
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserPlus,
  Cloud,
  Check,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  KeyRound,
  GraduationCap,
  Eye,
  EyeOff,
  LogIn,
  Send,
  ArrowLeft,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onSyncSuccess?: () => void;
  onLogoutSuccess?: () => void;
  onLoginSuccess?: () => void;
}

export type AuthTab = 'email' | 'google';
export type EmailSubView = 'login' | 'register' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSyncSuccess,
  onLogoutSuccess,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [emailSubView, setEmailSubView] = useState<EmailSubView>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email / Senha form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(user.grade || '6_fund');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [guestNickname, setGuestNickname] = useState<string>(user.name && user.name !== 'Estudante' ? user.name : '');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setEmailSubView('login');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setSelectedGrade(user.grade || '6_fund');

      // Se o usuário já tiver dados no perfil, pré-preenche para conveniência
      if (user.email && !email) {
        setEmail(user.email);
      }
      if (user.name && user.name !== 'Estudante' && !displayName) {
        setDisplayName(user.name);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUser = FirebaseService.getCurrentUser();
  const isLoggedIn = Boolean(currentUser || (user.userId && !user.userId.startsWith('guest_')));

  // Helper comum para pós-autenticação: salva os dados verdadeiros e preserva o progresso
  const handleAuthSuccess = async (
    firebaseUser: any,
    methodLabel: string,
    registrationData?: { name: string; grade: GradeLevel; email: string }
  ) => {
    try {
      const existingData = await FirebaseService.restoreProgress(firebaseUser.uid);

      if (existingData && !registrationData) {
        // Preserva todos os dados do Firestore e integra com o perfil local
        const updatedProfile: Partial<UserProfile> = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || user.email || undefined,
          photoURL: firebaseUser.photoURL || user.photoURL || undefined,
          name: existingData.name || firebaseUser.displayName || user.name,
          grade: (existingData.grade as GradeLevel) || user.grade,
          avatar: existingData.avatar || user.avatar,
          avatarId: existingData.avatarId || user.avatarId,
          totalPoints: Math.max(user.totalPoints || 0, existingData.totalPoints || 0),
          completedChallenges: Math.max(user.completedChallenges || 0, existingData.completedChallenges || 0),
          totalCorrectAnswers: Math.max(user.totalCorrectAnswers || 0, existingData.totalCorrectAnswers || 0),
          customSubjects: existingData.customSubjects || user.customSubjects,
          hasConfiguredSubjects: true,
          lastSyncedAt: new Date().toISOString(),
        };

        onUpdateUser(updatedProfile);
        try {
          localStorage.setItem('estudahud_user_profile_v3', JSON.stringify({ ...user, ...updatedProfile }));
        } catch {}
        await FirebaseService.syncProgress(firebaseUser.uid, updatedProfile);
      } else {
        // Nova conta ou cadastro explícito: salva exatamente os dados VERDADEIROS informados pelo usuário
        const resolvedName = registrationData?.name || displayName.trim() || firebaseUser.displayName || user.name || 'Estudante';
        const resolvedGrade = registrationData?.grade || selectedGrade || user.grade || '6_fund';
        const resolvedEmail = registrationData?.email || email.trim() || firebaseUser.email || user.email || undefined;

        const realProfile: Partial<UserProfile> = {
          userId: firebaseUser.uid,
          email: resolvedEmail,
          photoURL: firebaseUser.photoURL || user.photoURL || undefined,
          name: resolvedName,
          grade: resolvedGrade,
          avatar: user.avatar,
          avatarId: user.avatarId,
          totalPoints: user.totalPoints || 0,
          completedChallenges: user.completedChallenges || 0,
          totalCorrectAnswers: user.totalCorrectAnswers || 0,
          customSubjects: user.customSubjects,
          hasConfiguredSubjects: true,
          lastSyncedAt: new Date().toISOString(),
        };

        onUpdateUser(realProfile);
        try {
          localStorage.setItem('estudahud_user_profile_v3', JSON.stringify({ ...user, ...realProfile }));
        } catch {}
        await FirebaseService.syncProgress(firebaseUser.uid, realProfile);
      }

      soundEffects.playVictoryFanfare();
      setSuccessMessage(`Conectado com sucesso (${methodLabel})!`);
      onSyncSuccess?.();
      setTimeout(() => {
        onClose();
        onLoginSuccess?.();
      }, 1000);
    } catch (err: any) {
      console.warn('Erro pós-login sync:', err);
      onUpdateUser({ userId: firebaseUser.uid, email: firebaseUser.email || undefined });
      setSuccessMessage('Conectado com sucesso!');
      setTimeout(() => {
        onClose();
        onLoginSuccess?.();
      }, 1000);
    }
  };

  // ===================== 1. LOGIN COM E-MAIL E SENHA =====================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos cliques concorrentes

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail.');
      soundEffects.playError();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor, digite um e-mail válido (ex: seu.nome@email.com).');
      soundEffects.playError();
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha.');
      soundEffects.playError();
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      soundEffects.playError();
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      soundEffects.playClick();
      const firebaseUser = await FirebaseService.loginWithEmail(cleanEmail, password);
      if (!firebaseUser) {
        throw new Error('Não foi possível realizar o login.');
      }
      await handleAuthSuccess(firebaseUser, 'E-mail e Senha');
    } catch (err: any) {
      const msg = FirebaseService.formatAuthErrorMessage(err);
      setErrorMessage(msg);
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  // ===================== 2. CADASTRO DE CONTA COM DADOS VERDADEIROS =====================
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos cliques concorrentes

    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanGrade = selectedGrade;

    if (!cleanName) {
      setErrorMessage('Por favor, digite seu nome ou apelido de estudante.');
      soundEffects.playError();
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Por favor, preencha o campo de e-mail.');
      soundEffects.playError();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor, digite um e-mail válido (ex: seu.nome@email.com).');
      soundEffects.playError();
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, crie uma senha.');
      soundEffects.playError();
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha é muito fraca. Digite pelo menos 6 caracteres.');
      soundEffects.playError();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite exatamente a mesma senha nos dois campos.');
      soundEffects.playError();
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      soundEffects.playClick();
      // Cria a conta no Firebase Authentication com o nome e e-mail verdadeiros
      const firebaseUser = await FirebaseService.registerWithEmail(cleanEmail, password, cleanName);
      if (!firebaseUser) {
        throw new Error('Não foi possível criar a conta.');
      }

      // Salva imediatamente os DADOS VERDADEIROS (nome, série escolar e e-mail) no Firestore e perfil local
      await handleAuthSuccess(firebaseUser, 'Conta Criada', {
        name: cleanName,
        grade: cleanGrade,
        email: cleanEmail,
      });
    } catch (err: any) {
      const msg = FirebaseService.formatAuthErrorMessage(err);
      setErrorMessage(msg);
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  // ===================== 3. RECUPERAÇÃO DE SENHA =====================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos cliques

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, digite o e-mail cadastrado da sua conta.');
      soundEffects.playError();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor, digite um e-mail válido (ex: seu.nome@email.com).');
      soundEffects.playError();
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      soundEffects.playClick();
      await FirebaseService.sendPasswordReset(cleanEmail);
      soundEffects.playSuccess();
      setSuccessMessage(
        `E-mail de redefinição enviado com sucesso para "${cleanEmail}"! Verifique sua caixa de entrada e a pasta de spam para cadastrar sua nova senha.`
      );
    } catch (err: any) {
      const msg = FirebaseService.formatAuthErrorMessage(err);
      setErrorMessage(msg);
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  // ===================== 4. LOGIN COM GOOGLE =====================
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      soundEffects.playClick();
      const firebaseUser = await FirebaseService.loginWithGoogle();
      if (!firebaseUser) {
        throw new Error('Não foi possível obter os dados da conta Google.');
      }
      await handleAuthSuccess(firebaseUser, 'Google');
    } catch (err: any) {
      const msg = FirebaseService.formatAuthErrorMessage(err);
      setErrorMessage(msg);
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  // ===================== 5. SINCRONIZAR PROGRESSO MANUALMENTE =====================
  const handleManualSync = async () => {
    const uid = currentUser?.uid || user.userId;
    if (!uid || uid.startsWith('guest_')) {
      setErrorMessage('Conecte-se com sua conta para salvar e sincronizar o progresso na nuvem.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      soundEffects.playClick();
      const payload: Partial<UserProfile> = {
        name: user.name,
        grade: user.grade,
        avatar: user.avatar,
        avatarId: user.avatarId,
        totalPoints: user.totalPoints || 0,
        completedChallenges: user.completedChallenges || 0,
        totalCorrectAnswers: user.totalCorrectAnswers || 0,
        email: currentUser?.email || user.email,
        customSubjects: user.customSubjects,
        hasConfiguredSubjects: user.hasConfiguredSubjects,
      };

      const ok = await FirebaseService.syncProgress(uid, payload);
      if (ok) {
        onUpdateUser({ lastSyncedAt: new Date().toISOString() });
        soundEffects.playVictoryFanfare();
        setSuccessMessage('Progresso sincronizado com a nuvem com sucesso!');
        onSyncSuccess?.();
      } else {
        throw new Error('Não foi possível sincronizar agora. Tente mais tarde.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao sincronizar dados.');
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  // ===================== 6. MODO CONVIDADO =====================
  const handleEnterGuestMode = async () => {
    if (loading) return;
    soundEffects.playSuccess();
    setLoading(true);
    const chosenName = guestNickname.trim() || user.name || 'Estudante';
    try {
      const guest = await FirebaseService.loginAsGuest();
      const updated: Partial<UserProfile> = {
        userId: guest.uid,
        email: undefined,
        name: chosenName,
        avatar: user.avatar || 'graduation-cap',
        isFirstTime: false,
      };
      onUpdateUser(updated);
      try {
        localStorage.setItem('estudahud_user_profile_v3', JSON.stringify({ ...user, ...updated }));
      } catch {}
      setSuccessMessage('Entrou no Modo Visitante com sucesso!');
      setTimeout(() => {
        onClose();
        onLoginSuccess?.();
      }, 500);
    } catch {
      const fallbackUid = `guest_${Date.now()}`;
      const updated: Partial<UserProfile> = {
        userId: fallbackUid,
        email: undefined,
        name: chosenName,
        avatar: user.avatar || 'graduation-cap',
        isFirstTime: false,
      };
      onUpdateUser(updated);
      try {
        localStorage.setItem('estudahud_user_profile_v3', JSON.stringify({ ...user, ...updated }));
      } catch {}
      setSuccessMessage('Entrou no Modo Visitante com sucesso!');
      setTimeout(() => {
        onClose();
        onLoginSuccess?.();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // ===================== 7. SAIR DA CONTA (LOGOUT) =====================
  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      soundEffects.playClick();
      const uid = currentUser?.uid;
      if (uid && !uid.startsWith('guest_')) {
        try {
          await FirebaseService.syncProgress(uid, {
            name: user.name,
            grade: user.grade,
            avatar: user.avatar,
            avatarId: user.avatarId,
            totalPoints: user.totalPoints,
            completedChallenges: user.completedChallenges,
            totalCorrectAnswers: user.totalCorrectAnswers,
            email: currentUser?.email || user.email,
            customSubjects: user.customSubjects,
            hasConfiguredSubjects: user.hasConfiguredSubjects,
          });
        } catch (syncErr) {
          console.warn('Aviso de sync ao sair:', syncErr);
        }
      }
      await FirebaseService.logout();
      onUpdateUser({ userId: undefined, email: undefined, photoURL: undefined });
      setSuccessMessage('Você desconectou da conta e voltou para o Modo Convidado.');
      onLogoutSuccess?.();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage('Erro ao sair da conta: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border ${
                isLoggedIn
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}
            >
              {isLoggedIn ? <Cloud className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isLoggedIn ? 'Conta Conectada' : 'Acesso & Login'}
              </h3>
              <p className="text-xs text-slate-500">
                {isLoggedIn ? 'Sincronizado via Firebase' : 'E-mail e Senha ou Google'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* ================= SEÇÃO: USUÁRIO JÁ CONECTADO ================= */}
        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-7 h-7 text-indigo-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 truncate">
                      {user.name || currentUser?.displayName || 'Estudante'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Conectado
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 font-semibold truncate">
                    {user.email || currentUser?.email || 'Conta Firebase'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-bold">
                    {GRADE_LABELS[user.grade]?.full || 'Ensino Fundamental'}
                  </p>
                </div>
              </div>

              {/* Estatísticas salvas */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-200/50 text-center">
                <div className="p-2 bg-white/80 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-500 font-bold block">Pontos XP</span>
                  <span className="text-sm font-black text-indigo-700">
                    {(user.totalPoints || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="p-2 bg-white/80 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-500 font-bold block">Acertos</span>
                  <span className="text-sm font-black text-emerald-700">{user.totalCorrectAnswers || 0}</span>
                </div>
                <div className="p-2 bg-white/80 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-500 font-bold block">Desafios</span>
                  <span className="text-sm font-black text-purple-700">{user.completedChallenges || 0}</span>
                </div>
              </div>

              {user.lastSyncedAt && (
                <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>
                    Última sincronização:{' '}
                    {new Date(user.lastSyncedAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Sincronizando...' : 'Sincronizar Progresso Agora'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta (Voltar para Convidado)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= SEÇÃO: ESCOLHA DE LOGIN E CADASTRO ================= */
          <div className="space-y-4">
            {/* Tabs de Seleção: E-mail e Senha OU Google */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('email');
                  setEmailSubView('login');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>E-mail e Senha</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('google');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'google'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* ================= ABA: E-MAIL E SENHA ================= */}
            {activeTab === 'email' && (
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 rounded-2xl space-y-3.5 animate-in fade-in duration-150">
                {/* 1.1 TELA DE LOGIN COM E-MAIL E SENHA */}
                {emailSubView === 'login' && (
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <LogIn className="w-4 h-4 text-indigo-600" />
                          <span>Entrar com e-mail e senha</span>
                        </h4>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                          Firebase
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Acesse sua conta para salvar notas, estrelas e histórico na nuvem.
                      </p>
                    </div>

                    {/* Campo E-mail */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>E-mail:</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                      />
                    </div>

                    {/* Campo Senha */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Senha:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setEmailSubView('forgot_password');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                        >
                          Esqueci minha senha
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite sua senha"
                          autoComplete="current-password"
                          disabled={loading}
                          required
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Botão Entrar */}
                    <button
                      type="submit"
                      disabled={loading || !email.trim() || !password.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Entrando na conta...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Entrar</span>
                        </>
                      )}
                    </button>

                    {/* Botão Criar Conta */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Novo por aqui?</span>
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setEmailSubView('register');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs transition cursor-pointer flex items-center gap-1 border border-indigo-200/80"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Criar conta</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 1.2 TELA DE CADASTRO COM NOME, SÉRIE ESCOLAR, E-MAIL E SENHA */}
                {emailSubView === 'register' && (
                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4 text-purple-600" />
                          <span>Criar Conta de Estudante</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setEmailSubView('login');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Já tenho conta</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Informe seus dados verdadeiros para salvar notas, matérias e progresso na nuvem.
                      </p>
                    </div>

                    {/* Nome ou Apelido */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Nome ou Apelido:</span>
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Digite seu nome ou apelido"
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                      />
                    </div>

                    {/* Série Escolar do Aluno */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Série Escolar do Estudante:</span>
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white cursor-pointer disabled:bg-slate-100 transition shadow-2xs"
                      >
                        <optgroup label="Ensino Fundamental I">
                          <option value="1_fund">1º Ano do Ensino Fundamental</option>
                          <option value="2_fund">2º Ano do Ensino Fundamental</option>
                          <option value="3_fund">3º Ano do Ensino Fundamental</option>
                          <option value="4_fund">4º Ano do Ensino Fundamental</option>
                          <option value="5_fund">5º Ano do Ensino Fundamental</option>
                        </optgroup>
                        <optgroup label="Ensino Fundamental II">
                          <option value="6_fund">6º Ano do Ensino Fundamental</option>
                          <option value="7_fund">7º Ano do Ensino Fundamental</option>
                          <option value="8_fund">8º Ano do Ensino Fundamental</option>
                          <option value="9_fund">9º Ano do Ensino Fundamental</option>
                        </optgroup>
                        <optgroup label="Ensino Médio & ENEM">
                          <option value="1_medio">1ª Série do Ensino Médio</option>
                          <option value="2_medio">2ª Série do Ensino Médio</option>
                          <option value="3_medio">3ª Série do Ensino Médio</option>
                          <option value="enem">Pré-Vestibular & ENEM</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>E-mail:</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                      />
                    </div>

                    {/* Senha */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Senha (mínimo 6 caracteres):</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          autoComplete="new-password"
                          disabled={loading}
                          required
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Confirmar a Senha:</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a mesma senha"
                        autoComplete="new-password"
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                      />
                    </div>

                    {/* Botão Criar Conta */}
                    <button
                      type="submit"
                      disabled={loading || !displayName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Criando conta e conectando...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Criar Conta e Entrar</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 1.3 TELA DE RECUPERAÇÃO DE SENHA */}
                {emailSubView === 'forgot_password' && (
                  <form onSubmit={handleForgotPassword} className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <span>Recuperar Minha Senha</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setEmailSubView('login');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Voltar ao login</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Digite seu e-mail cadastrado. Enviaremos o link oficial do Firebase para você redefinir sua senha com segurança.
                      </p>
                    </div>

                    {/* Campo E-mail */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>E-mail cadastrado:</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        disabled={loading}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                      />
                    </div>

                    {/* Botão Enviar Link de Recuperação */}
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Enviando e-mail...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar E-mail de Redefinição</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ================= ABA: LOGIN COM GOOGLE ================= */}
            {activeTab === 'google' && (
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full inline-block">
                    1 Toque
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    Conectar com Conta Google
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sincronize seu progresso, estrelas, cadernos e notas na nuvem através do Firebase Authentication com 1 toque.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? 'Conectando ao Google...' : 'Entrar com Google'}</span>
                </button>
              </div>
            )}

            {/* Divisor */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                ou continue sem cadastro
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Bloco Modo Visitante (Continuar sem cadastro) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Continuar sem cadastro (Modo Visitante)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Informe apenas seu nome ou apelido. Não é necessário e-mail.
                  </p>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Sem e-mail
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={guestNickname}
                  onChange={(e) => setGuestNickname(e.target.value)}
                  placeholder="Seu nome ou apelido (ex: Gabriel)"
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-bold text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-100 transition"
                />
                <button
                  type="button"
                  onClick={handleEnterGuestMode}
                  disabled={loading}
                  className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer active:scale-95 shadow-xs shrink-0 flex items-center gap-1"
                >
                  <span>Entrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
