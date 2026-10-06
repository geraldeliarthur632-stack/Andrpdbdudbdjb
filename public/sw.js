// Trilha do Saber Service Worker - Offline Caching, Background Sync & Local Push Notifications for 'Dica de Estudo do Dia'
const CACHE_NAME = 'trilha-do-saber-cache-v8';

// Compute scope base URL dynamically to ensure compatibility with subfolders like GitHub Pages
const SCOPE_URL = self.registration ? self.registration.scope : self.location.origin + '/';
const getAssetUrl = (relativeOrAbsolute) => new URL(relativeOrAbsolute, SCOPE_URL).href;

// Core shell assets to precache for offline functionality
const PRECACHE_ASSETS = [
  getAssetUrl('./'),
  getAssetUrl('./index.html'),
  getAssetUrl('./manifest.json'),
  getAssetUrl('./icon.svg'),
  getAssetUrl('./app-logo.png'),
];

// High-impact pedagogical study tips available completely offline inside the Service Worker
const OFFLINE_STUDY_TIPS = [
  {
    topic: 'Técnica Pomodoro Adaptada',
    tip: 'Estude em blocos de 25 minutos com foco total e faça pausas ativas de 5 minutos. Após 4 blocos, descanse 20 minutos para fixar os conceitos!',
    actionableStep: 'Faça 1 bloco de 25 minutos focado na sua matéria de maior dificuldade hoje.',
    targetSubject: 'Geral',
  },
  {
    topic: 'Matemática sem Erros de Sinal',
    tip: 'Ao resolver equações, destaque sempre os números negativos e parênteses. 68% dos erros em provas decorrem de troca de sinais por distração.',
    actionableStep: 'Sublinhe em cor diferente cada operador negativo no seu próximo exercício.',
    targetSubject: 'Matemática',
  },
  {
    topic: 'Curva do Esquecimento e Repetição Espaçada',
    tip: 'Revisar o conteúdo 24 horas após a aula consolida até 80% da memória de longo prazo, economizando horas de estudo acumulado na véspera.',
    actionableStep: 'Dedique 5 minutos para revisar os tópicos que você estudou ontem no Let\'s Study.',
    targetSubject: 'Geral',
  },
  {
    topic: 'Interpretação e Leitura Crítica em Português',
    tip: 'Antes de ler o texto longo de uma questão, leia primeiro o enunciado e as alternativas. Seu cérebro fará uma leitura seletiva procurando a resposta exata.',
    actionableStep: 'Pratique essa técnica nas questões de português de hoje.',
    targetSubject: 'Português',
  },
  {
    topic: 'Autoexplicação (Técnica Feynman)',
    tip: 'Tente explicar o conceito em voz alta ou em um papel como se estivesse ensinando uma criança de 10 anos. Onde você travar é exatamente onde precisa revisar.',
    actionableStep: 'Explique para si mesmo o conceito principal da lição de hoje em 2 minutos.',
    targetSubject: 'Ciências',
  },
  {
    topic: 'Estratégia de Prova & Gestão de Tempo',
    tip: 'Em provas e simulados, faça uma primeira rodada respondendo apenas as fáceis e diretas. Deixe as difíceis e longas para a segunda rodada sem desespero.',
    actionableStep: 'Aplique a regra das duas rodadas no seu próximo Simulado BNCC.',
    targetSubject: 'Geral',
  },
  {
    topic: 'Mapeamento Mental e Conexões Visuais',
    tip: 'Conecte tópicos de História e Geografia usando mapas conceituais de causa e consequência em vez de apenas copiar parágrafos longos.',
    actionableStep: 'Desenhe um mini fluxograma com 3 caixas interligadas resumindo o tema atual.',
    targetSubject: 'História / Geografia',
  },
];

// Helper to pick a tip based on current day of the year
function getDailyOfflineTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = Math.abs(dayOfYear) % OFFLINE_STUDY_TIPS.length;
  return OFFLINE_STUDY_TIPS[index];
}

// 1. Install Event: Precache core assets and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error (ignored for resilient start):', err);
      });
    })
  );
});

// 2. Activate Event: Clean up stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first for dynamic content with robust offline cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip non-HTTP / chrome extension schemes
  if (!url.protocol.startsWith('http')) return;

  // Never intercept Firebase, Google APIs, Auth, Cloud Firestore, or .well-known
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/.well-known/') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('identitytoolkit')
  ) {
    return;
  }

  // Handle SPA navigation requests: network first -> fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(getAssetUrl('./index.html')).then((cached) => {
            return cached || caches.match(getAssetUrl('./'));
          });
        })
    );
    return;
  }

  // Handle static assets (JS, CSS, images, icons, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update cache in background (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not cached, fetch from network and cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Graceful fallback for images / icons
          if (request.destination === 'image') {
            return caches.match(getAssetUrl('./icon.svg'));
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});

// 4. Periodic Background Sync (runs in background even when offline or closed)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-study-tip-sync') {
    const tip = getDailyOfflineTip();
    event.waitUntil(
      self.registration.showNotification(`💡 Dica de Estudo do Dia: ${tip.topic}`, {
        body: `${tip.tip}\n\n👉 Passo de hoje: ${tip.actionableStep}`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: `daily_tip_periodic_${new Date().toDateString()}`,
        data: { url: '/?tab=study_tips', type: 'daily_tip', tip },
        actions: [
          { action: 'open_tip', title: '💡 Ver Dica' },
          { action: 'listen_tip', title: '🔊 Ouvir Dica' },
          { action: 'study_now', title: '🚀 Praticar' },
        ],
      })
    );
  } else if (event.tag === 'study-reminder-sync') {
    event.waitUntil(
      self.registration.showNotification("⏰ Lembrete de Estudos Trilha do Saber", {
        body: 'Mantenha sua ofensiva diária ativa! Venha resolver seus desafios escolares de hoje.',
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: '/', type: 'reminder' },
      })
    );
  }
});

// 5. Handle Native Push Events (Server push or Web Push)
self.addEventListener('push', (event) => {
  const offlineTip = getDailyOfflineTip();
  let title = `💡 Dica de Estudo do Dia: ${offlineTip.topic}`;
  let options = {
    body: `${offlineTip.tip}\n\n👉 Passo de hoje: ${offlineTip.actionableStep}`,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: `daily_tip_push_${Date.now()}`,
    data: { url: '/?tab=study_tips', type: 'daily_tip', tip: offlineTip },
    actions: [
      { action: 'open_tip', title: '💡 Ver Dica' },
      { action: 'listen_tip', title: '🔊 Ouvir Dica' },
      { action: 'study_now', title: '🚀 Praticar' },
    ],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.title) title = payload.title;
      if (payload.body) options.body = payload.body;
      if (payload.data) options.data = payload.data;
      if (payload.actions) options.actions = payload.actions;
      if (payload.tag) options.tag = payload.tag;
    } catch {
      const text = event.data.text();
      if (text) options.body = text;
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// 6. Handle Notification Click Interactions
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  // If user clicked Dismiss/Stop Alarm
  if (action === 'stop_alarm') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          client.postMessage({ type: 'STOP_EXAM_ALARM' });
        }
      })
    );
    return;
  }

  if (action === 'snooze_10') {
    setTimeout(() => {
      self.registration.showNotification("🎒 Trilha do Saber: Lembrete de Estudo", {
        body: 'Seus 10 minutos de pausa terminaram. Vamos continuar os estudos e desafios!',
        icon: '/icon.svg',
        badge: '/icon.svg',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { url: '/' },
        actions: [{ action: 'study_now', title: '⚡ Abrir App' }],
      });
    }, 10 * 60 * 1000);
    return;
  }

  if (action === 'snooze_15') {
    setTimeout(() => {
      self.registration.showNotification("🔥 Trilha do Saber: Meta Diária", {
        body: 'Sua pausa de 15 minutos terminou! Vamos resolver alguns exercícios rápidos para fechar sua meta de hoje?',
        icon: '/icon.svg',
        badge: '/icon.svg',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: { url: '/' },
        actions: [{ action: 'study_now', title: '⚡ Estudar Agora' }],
      });
    }, 15 * 60 * 1000);
    return;
  }

  let urlToOpen = (notification.data && notification.data.url) ? getAssetUrl(notification.data.url) : SCOPE_URL;
  if (action === 'open_exam') {
    urlToOpen = getAssetUrl('./?modal=calendar');
  } else if (action === 'listen_tip') {
    urlToOpen = getAssetUrl('./?action=speak_tip');
  } else if (action === 'study_now') {
    urlToOpen = getAssetUrl('./?mode=simulado');
  } else if (action === 'open_tip') {
    urlToOpen = getAssetUrl('./?tab=study_tips');
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client && urlToOpen !== SCOPE_URL) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 7. Web Push API: Listen for incoming push messages even when browser is completely closed
self.addEventListener('push', (event) => {
  let data = {
    title: '🎒 Trilha do Saber: Hora do seu Estudo Agendado!',
    body: 'Seu horário de estudos programado começou. Toque para abrir seus exercícios e ganhar XP!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: `web_push_${Date.now()}`,
    data: { url: '/?mode=journey' },
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationPromise = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [250, 100, 250, 100, 250],
    requireInteraction: true,
    tag: data.tag,
    data: data.data || { url: '/?mode=journey' },
    actions: [
      { action: 'study_now', title: '⚡ Estudar Agora' },
      { action: 'snooze_15', title: '⏳ Lembrar em 15m' },
    ],
  });

  event.waitUntil(notificationPromise);
});

// 8. Handle Client PostMessages (Schedule Local Push Notifications & Alarms)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  // Immediate Local Notification trigger
  if (type === 'SHOW_NOTIFICATION' && payload) {
    const { title, options } = payload;
    self.registration.showNotification(title || "💡 Dica de Estudo do Dia - Trilha do Saber", {
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open_tip', title: '💡 Ver Dica' },
        { action: 'listen_tip', title: '🔊 Ouvir Dica' },
        { action: 'study_now', title: '🚀 Praticar' },
      ],
      ...options,
    });
  }

  // Schedule Exam Alarm (rings as authentic exam alarm push in background)
  else if (type === 'SCHEDULE_EXAM_ALARM' && payload) {
    const { title, options, delayMs } = payload;
    if (delayMs && delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(title || "🚨 ALARME: Prova Agendada!", {
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [300, 100, 300, 100, 300, 100, 500],
          requireInteraction: true,
          actions: [
            { action: 'stop_alarm', title: '🔕 Desligar Alarme' },
            { action: 'open_exam', title: '📝 Ver Prova' },
          ],
          ...options,
        });

        // Broadcast to clients to sound active alarm if page is alive
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
          for (const client of windowClients) {
            client.postMessage({ type: 'TRIGGER_EXAM_ALARM_SOUND', payload });
          }
        });
      }, delayMs);
    }
  }

  // Schedule Reminder Alarm
  else if (type === 'SCHEDULE_REMINDER' && payload) {
    const { title, options, delayMs } = payload;
    if (delayMs && delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(title || "🎒 Trilha do Saber: Hora de Estudar!", {
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'study_now', title: '⚡ Estudar Agora' },
          ],
          ...options,
        });
      }, delayMs);
    }
  }

  // Schedule Daily Goal Study Reminder Alarm
  else if (type === 'SCHEDULE_DAILY_GOAL_REMINDER' && payload) {
    const { title, options, delayMs } = payload;
    if (delayMs && delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(title || "🔥 Não perca sua sequência! Meta de hoje", {
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [200, 100, 200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'study_now', title: '🚀 Estudar Agora' },
            { action: 'snooze_15', title: '⏳ Lembrar em 15 min' },
          ],
          ...options,
        });
      }, delayMs);
    }
  }

  // Schedule Daily Study Tip Alarm with fallback offline generation
  else if (type === 'SCHEDULE_DAILY_TIP' && payload) {
    const { title, options, delayMs } = payload;
    const fallbackTip = getDailyOfflineTip();
    const finalTitle = title || `💡 Dica de Estudo do Dia: ${fallbackTip.topic}`;
    const defaultBody = options?.body || `${fallbackTip.tip}\n\n👉 Passo de hoje: ${fallbackTip.actionableStep}`;

    if (delayMs && delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(finalTitle, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'open_tip', title: '💡 Ver Dica' },
            { action: 'listen_tip', title: '🔊 Ouvir Dica' },
            { action: 'study_now', title: '🚀 Praticar' },
          ],
          ...options,
          body: defaultBody,
          data: { url: '/?tab=study_tips', type: 'daily_tip', tip: fallbackTip },
        });
      }, delayMs);
    }
  }

  // Trigger Immediate Daily Tip Test Notification
  else if (type === 'TRIGGER_TEST_DAILY_TIP') {
    const tip = getDailyOfflineTip();
    self.registration.showNotification(`💡 Teste: Dica de Estudo (${tip.topic})`, {
      body: `${tip.tip}\n\n👉 Passo de hoje: ${tip.actionableStep}`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: `daily_tip_test_${Date.now()}`,
      data: { url: '/?tab=study_tips', type: 'daily_tip', tip },
      actions: [
        { action: 'open_tip', title: '💡 Ver Dica' },
        { action: 'listen_tip', title: '🔊 Ouvir Dica' },
        { action: 'study_now', title: '🚀 Praticar' },
      ],
    });
  }

  // Schedule Web Push & Background Study Reminders Batch (even when browser closes)
  else if (type === 'SCHEDULE_PUSH_REMINDERS_BATCH' && payload && Array.isArray(payload.reminders)) {
    payload.reminders.forEach((item) => {
      if (item.delayMs && item.delayMs > 0) {
        setTimeout(() => {
          self.registration.showNotification(item.title || "🎒 Trilha do Saber: Hora de Estudar!", {
            body: item.body || 'Seu horário agendado de estudos começou!',
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: [250, 100, 250, 100, 250],
            requireInteraction: true,
            tag: item.tag || `study_push_${Date.now()}`,
            data: { url: '/?mode=journey' },
            actions: [
              { action: 'study_now', title: '⚡ Estudar Agora' },
              { action: 'snooze_15', title: '⏳ 15 min' },
            ],
          });
        }, item.delayMs);
      }
    });
  }

  // Trigger Immediate Web Push Study Reminder Test (allows testing background notification in 5s)
  else if (type === 'TRIGGER_TEST_PUSH_STUDY_REMINDER' && payload) {
    const delay = payload.delayMs || 5000;
    setTimeout(() => {
      self.registration.showNotification("🎒 Web Push: Hora de Estudar Agendada!", {
        body: payload.body || "Teste de lembrete em segundo plano recebido com sucesso! O Web Push funciona mesmo com o navegador fechado.",
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true,
        tag: `web_push_test_${Date.now()}`,
        data: { url: '/?mode=journey' },
        actions: [
          { action: 'study_now', title: '⚡ Abrir e Estudar' },
        ],
      });
    }, delay);
  }

  // Trigger Immediate Firebase Cloud Messaging (FCM) Background Study Reminder Test
  else if (type === 'TRIGGER_TEST_FCM_REMINDER' && payload) {
    const delay = payload.delayMs || 5000;
    const title = payload.title || "📲 FCM: Lembrete Personalizado de Estudo!";
    const body = payload.body || "Olá! O cronograma de estudos indica que sua matéria está próxima de iniciar. Prepare seu material!";
    const subjectId = payload.subjectId || 'matematica';

    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [350, 100, 350, 100, 350],
        requireInteraction: true,
        tag: `fcm_test_${Date.now()}`,
        data: { url: `/?mode=journey&subject=${subjectId}`, subjectId, type: 'fcm_study_reminder' },
        actions: [
          { action: 'study_now', title: '⚡ Estudar Agora' },
          { action: 'snooze_15', title: '⏳ Lembrar em 15m' },
        ],
      });
    }, delay);
  }

  // Schedule Advance FCM Study Reminders (triggered before subject begins)
  else if (type === 'SCHEDULE_FCM_ADVANCE_REMINDERS' && payload && Array.isArray(payload.reminders)) {
    payload.reminders.forEach((item) => {
      if (item.delayMs && item.delayMs > 0) {
        setTimeout(() => {
          self.registration.showNotification(item.title || "🎒 Trilha do Saber: Lembrete Prévio de Estudo!", {
            body: item.body || 'Sua matéria no cronograma começará em breve!',
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: [300, 100, 300, 100, 300],
            requireInteraction: true,
            tag: item.tag || `fcm_advance_${Date.now()}`,
            data: { url: item.url || `/?mode=journey&subject=${item.subjectId || 'matematica'}` },
            actions: [
              { action: 'study_now', title: '⚡ Abrir e Estudar' },
              { action: 'snooze_15', title: '⏳ Lembrar em 15 min' },
            ],
          });
        }, item.delayMs);
      }
    });
  }
});
