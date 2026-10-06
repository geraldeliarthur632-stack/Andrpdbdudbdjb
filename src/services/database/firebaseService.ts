import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  Auth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (appInstance) return appInstance;
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return appInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase App:', err);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (dbInstance) return dbInstance;

  try {
    const app = getFirebaseApp();
    if (!app) return null;

    const dbId =
      firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
        ? firebaseConfig.firestoreDatabaseId
        : undefined;

    try {
      dbInstance = initializeFirestore(
        app,
        {
          experimentalAutoDetectLongPolling: true,
        },
        dbId
      );
    } catch {
      dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    }

    // Teste de conexão não bloqueante
    testConnection(dbInstance);

    return dbInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase Firestore:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (authInstance) return authInstance;

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    authInstance = getAuth(app);
    try {
      setPersistence(authInstance, browserLocalPersistence).catch((err) => {
        console.warn('Aviso de configuração de persistência de sessão:', err?.message || err);
      });
    } catch {}
    return authInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase Auth:', err);
    return null;
  }
}

let hasTestedConnection = false;
async function testConnection(db: Firestore) {
  if (hasTestedConnection) return;
  hasTestedConnection = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Aviso: Firestore em modo offline ou conectando em segundo plano.');
    }
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo | null {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isPermissionError =
    errMsg.includes('Missing or insufficient permissions') ||
    errMsg.includes('permission-denied') ||
    errMsg.includes('PERMISSION_DENIED');

  if (!isPermissionError) {
    console.warn(`Firestore aviso (${operationType} em ${path}):`, errMsg);
    return null;
  }

  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export class FirebaseService {
  static isAvailable(): boolean {
    return isFirebaseConfigured();
  }

  static getAuth(): Auth | null {
    return getFirebaseAuth();
  }

  static getCurrentUser(): FirebaseUser | null {
    const auth = getFirebaseAuth();
    return auth?.currentUser || null;
  }

  static onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  static usernameToInternalEmail(username: string): string {
    const clean = username
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_');
    return `${clean || 'estudante'}@trilhadosaber.app`;
  }

  static formatAuthErrorMessage(err: any): string {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
      return 'Digite um e-mail válido (exemplo: seu.nome@email.com).';
    }
    if (code === 'auth/missing-email' || message.includes('auth/missing-email')) {
      return 'Por favor, digite seu e-mail.';
    }
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials' ||
      message.includes('auth/wrong-password') ||
      message.includes('auth/invalid-credential') ||
      message.includes('auth/invalid-login-credentials')
    ) {
      return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
    }
    if (code === 'auth/user-not-found' || message.includes('auth/user-not-found')) {
      return 'Nenhum usuário encontrado com este e-mail. Verifique a digitação ou crie uma nova conta.';
    }
    if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
      return 'Este e-mail já está cadastrado. Tente fazer login ou clique em "Esqueci minha senha".';
    }
    if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
      return 'A senha é muito fraca. Digite pelo menos 6 caracteres.';
    }
    if (code === 'auth/missing-password' || message.includes('auth/missing-password')) {
      return 'Por favor, digite sua senha.';
    }
    if (code === 'auth/network-request-failed' || message.includes('auth/network-request-failed')) {
      return 'Verifique sua conexão com a internet e tente novamente.';
    }
    if (code === 'auth/too-many-requests' || message.includes('auth/too-many-requests')) {
      return 'Muitas tentativas sem sucesso. Por segurança, aguarde alguns instantes antes de tentar novamente.';
    }
    if (code === 'auth/user-disabled' || message.includes('auth/user-disabled')) {
      return 'Esta conta de estudante foi desativada.';
    }
    if (code === 'auth/operation-not-allowed' || message.includes('auth/operation-not-allowed')) {
      return 'Este método de login precisa ser ativado no Firebase Console (Authentication > Sign-in method).';
    }
    if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
      return 'Login cancelado. Você pode tentar novamente a qualquer momento.';
    }
    if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
      return 'A janela pop-up do Google foi bloqueada pelo navegador. Permita pop-ups ou tente por E-mail e Senha.';
    }
    if (code === 'auth/account-exists-with-different-credential' || message.includes('account-exists-with-different-credential')) {
      return 'Já existe uma conta com este mesmo e-mail vinculada a outro método. Entre com o método utilizado anteriormente (E-mail ou Google).';
    }
    if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
      return 'Este domínio web ainda não foi adicionado aos domínios autorizados do Firebase Console (Authentication > Settings > Authorized domains).';
    }
    if (code === 'auth/invalid-phone-number') {
      return 'Número de telefone inválido. Digite o número com o DDD, por exemplo: +55 11 99999-8888.';
    }
    if (code === 'auth/missing-phone-number') {
      return 'Por favor, digite seu número de telefone com o DDD.';
    }
    if (code === 'auth/quota-exceeded') {
      return 'Limite de requisições do Firebase atingido no momento. Tente novamente mais tarde ou use o Modo Convidado.';
    }
    if (code === 'auth/invalid-verification-code') {
      return 'Código de verificação SMS incorreto. Verifique os 6 dígitos recebidos no seu celular.';
    }
    if (code === 'auth/code-expired') {
      return 'O código SMS expirou. Por favor, solicite um novo código.';
    }
    if (code === 'auth/captcha-check-failed') {
      return 'A verificação de segurança reCAPTCHA falhou ou expirou. Tente novamente.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Operação cancelada.';
    }
    return message || 'Ocorreu um erro ao autenticar. Tente novamente.';
  }

  /**
   * Configura o reCAPTCHA invisível do Firebase Web para verificação por SMS
   */
  static setupRecaptcha(containerId: string): RecaptchaVerifier | null {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    try {
      const elem = document.getElementById(containerId);
      if (elem) elem.innerHTML = '';
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA resolvido
        },
        'expired-callback': () => {
          console.warn('reCAPTCHA expirou.');
        },
      });
      return verifier;
    } catch (err) {
      console.warn('Erro ao configurar RecaptchaVerifier:', err);
      return null;
    }
  }

  /**
   * Envia SMS de verificação para o telefone informado (formato E.164: +5511999998888)
   */
  static async loginWithPhone(
    phoneNumber: string,
    appVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
      const formatted = cleanPhone.startsWith('+') ? cleanPhone : `+55${cleanPhone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      console.warn('Erro ao enviar SMS de verificação:', err);
      throw err;
    }
  }

  /**
   * Confirma o código SMS de 6 dígitos recebido no telefone
   */
  static async confirmPhoneCode(
    confirmationResult: ConfirmationResult,
    code: string
  ): Promise<FirebaseUser> {
    try {
      const cleanCode = code.trim().replace(/\D/g, '');
      const result = await confirmationResult.confirm(cleanCode);
      return result.user;
    } catch (err: any) {
      console.warn('Erro ao confirmar código SMS:', err);
      throw err;
    }
  }

  static async loginWithGoogleRedirect(): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth não inicializado.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, provider);
  }

  static async checkRedirectResult(): Promise<FirebaseUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    try {
      const result = await getRedirectResult(auth);
      return result?.user || null;
    } catch (err) {
      console.warn('Aviso no getRedirectResult:', err);
      return null;
    }
  }

  static async registerWithUsername(
    username: string,
    password: string,
    displayName?: string
  ): Promise<FirebaseUser | null> {
    const internalEmail = this.usernameToInternalEmail(username);
    const finalName = displayName?.trim() || username.trim();
    return this.registerWithEmail(internalEmail, password, finalName);
  }

  static async loginWithUsername(
    username: string,
    password: string
  ): Promise<FirebaseUser | null> {
    const internalEmail = this.usernameToInternalEmail(username);
    return this.loginWithEmail(internalEmail, password);
  }

  static async loginWithUserOrEmail(
    identifier: string,
    password: string
  ): Promise<FirebaseUser | null> {
    const clean = identifier.trim();
    if (clean.includes('@')) {
      return this.loginWithEmail(clean, password);
    }
    return this.loginWithUsername(clean, password);
  }

  static async loginAsGuest(): Promise<{ uid: string; displayName: string; isAnonymous: boolean }> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        const cred = await signInAnonymously(auth);
        if (cred?.user) {
          return {
            uid: cred.user.uid,
            displayName: cred.user.displayName || 'Convidado',
            isAnonymous: true,
          };
        }
      } catch (err: any) {
        console.info('Aviso convidado Firebase anônimo:', err?.message || err);
      }
    }
    // Local guest fallback always succeeds reliably
    let localUid = '';
    try {
      localUid = localStorage.getItem('estudahud_guest_uid') || '';
      if (!localUid) {
        localUid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('estudahud_guest_uid', localUid);
      }
    } catch {
      localUid = `guest_${Date.now()}`;
    }
    return {
      uid: localUid,
      displayName: 'Convidado',
      isAnonymous: true,
    };
  }

  static async loginWithGoogle(): Promise<FirebaseUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (err: any) {
      const code = err?.code || '';
      // Se popup estiver bloqueado no Android WebView/TWA ou navegador, tenta redirect
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return null;
        } catch (redirectErr) {
          console.warn('Falha no fallback de redirect do Google:', redirectErr);
          throw err;
        }
      }
      console.warn('Aviso no login do Google:', err?.message || err);
      throw err;
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return credential.user;
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        // Tentativa de reconexão automática única após pequeno atraso
        try {
          await new Promise((res) => setTimeout(res, 800));
          const retryCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          return retryCredential.user;
        } catch {}
      }
      console.warn('Aviso no login com e-mail/senha:', err?.message || err);
      throw err;
    }
  }

  static async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<FirebaseUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && credential.user) {
        try {
          await updateProfile(credential.user, { displayName });
        } catch (profileErr) {
          console.warn('Aviso ao atualizar displayName no perfil auth:', profileErr);
        }
      }
      return credential.user;
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        // Tentativa de reconexão automática única após pequeno atraso
        try {
          await new Promise((res) => setTimeout(res, 800));
          const retryCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (displayName && retryCredential.user) {
            try {
              await updateProfile(retryCredential.user, { displayName });
            } catch {}
          }
          return retryCredential.user;
        } catch {}
      }
      console.warn('Aviso no cadastro com e-mail/senha:', err?.message || err);
      throw err;
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.warn('Aviso ao enviar e-mail de recuperação de senha:', err?.message || err);
      throw err;
    }
  }

  static async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
  }

  static async syncProgress(userId: string, progressData: any): Promise<boolean> {
    const db = getDb();
    if (!db || !userId) return false;

    // Apenas sincroniza com o Firestore se o usuário estiver autenticado no Firebase
    // e o UID corresponder ao documento. Usuários convidados (guest_*) utilizam apenas armazenamento local.
    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.uid !== userId || userId.startsWith('guest_')) {
      return false;
    }

    const path = `users/${userId}`;
    try {
      const sanitized: Record<string, any> = {};
      Object.entries(progressData || {}).forEach(([key, val]) => {
        if (val !== undefined) {
          sanitized[key] = val;
        }
      });
      sanitized.lastSyncedAt = new Date().toISOString();

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, sanitized, { merge: true });
      return true;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes('offline') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('network') ||
        err?.code === 'unavailable'
      ) {
        console.warn('Aviso: Firestore offline durante syncProgress, dados salvos localmente:', errMsg);
        return false;
      }
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  }

  static async restoreProgress(userId: string): Promise<any | null> {
    const db = getDb();
    if (!db || !userId) return null;

    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.uid !== userId || userId.startsWith('guest_')) {
      return null;
    }

    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes('offline') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('network') ||
        err?.code === 'unavailable'
      ) {
        console.warn('Aviso: Firestore offline em restoreProgress, utilizando dados locais:', errMsg);
        return null;
      }
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }
}

