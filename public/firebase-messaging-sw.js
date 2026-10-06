// Firebase Cloud Messaging Service Worker for Trilha do Saber
// Handles background study reminders when mobile browser or PWA is closed
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDAmIY2iq4AuaXKKG7MB3cFvwhW_0H6PDE",
  authDomain: "zeta-phoenix-56shk.firebaseapp.com",
  projectId: "zeta-phoenix-56shk",
  storageBucket: "zeta-phoenix-56shk.firebasestorage.app",
  messagingSenderId: "241062605571",
  appId: "1:241062605571:web:b3e0dbadb00eb374eb6f36"
});

const messaging = firebase.messaging();

const SCOPE_URL = self.registration ? self.registration.scope : self.location.origin + '/';
const getAssetUrl = (relativeOrAbsolute) => new URL(relativeOrAbsolute, SCOPE_URL).href;

// Background message handler from Firebase Cloud Messaging
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Mensagem recebida em segundo plano:', payload);

  const title = payload.notification?.title || payload.data?.title || '🎒 Trilha do Saber: Hora de Estudar!';
  const body = payload.notification?.body || payload.data?.body || 'Seu horário de estudos no cronograma está próximo. Prepare seu material!';
  const subjectId = payload.data?.subjectId || 'matematica';
  const url = payload.data?.url || getAssetUrl(`./?mode=journey&subject=${subjectId}`);

  const notificationOptions = {
    body,
    icon: getAssetUrl('./icon.svg'),
    badge: getAssetUrl('./icon.svg'),
    vibrate: [250, 100, 250, 100, 250],
    requireInteraction: true,
    tag: payload.data?.tag || `fcm_reminder_${Date.now()}`,
    data: {
      url,
      subjectId,
      type: 'fcm_study_reminder',
    },
    actions: [
      { action: 'study_now', title: '⚡ Abrir e Estudar' },
      { action: 'snooze_15', title: '⏳ Lembrar em 15m' },
    ],
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Click interaction for FCM Notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const targetUrl = event.notification.data?.url ? getAssetUrl(event.notification.data.url) : SCOPE_URL;

  if (action === 'snooze_15') {
    setTimeout(() => {
      self.registration.showNotification('🎒 Trilha do Saber: Lembrete de Estudo', {
        body: 'Sua pausa de 15 minutos terminou! Vamos começar a sessão no cronograma?',
        icon: getAssetUrl('./icon.svg'),
        badge: getAssetUrl('./icon.svg'),
        vibrate: [250, 100, 250],
        data: { url: targetUrl },
        actions: [
          { action: 'study_now', title: '⚡ Estudar Agora' }
        ]
      });
    }, 15 * 60 * 1000);
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl !== SCOPE_URL) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
