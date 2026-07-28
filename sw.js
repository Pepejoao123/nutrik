const CACHE = 'nutrik-v2';
const ASSETS = ['/nutrik/', '/nutrik/index.html', '/nutrik/manifest.json'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})))
);

self.addEventListener('activate', e =>
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
);

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/nutrik/index.html')))
  )
);

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_NOTIFS') {
    scheduleNotifications(e.data.payload);
  }
});

function scheduleNotifications(config) {
  if(self._notifTimers) self._notifTimers.forEach(t => clearTimeout(t));
  self._notifTimers = [];

  const now = new Date();
  const nome = config.nome || '';

  const notifs = [
    { hour:7,  min:0,  title:'☀️ Bom dia, '+nome+'!',         body:'Comece o dia hidratado! Tome um copo d\'água agora.' },
    { hour:7,  min:30, title:'🍳 Café da manhã',               body:'Não esqueça do café da manhã. Registre sua primeira refeição!' },
    { hour:8,  min:30, title:'💧 Hora da água!',               body:'Primeiro lembrete do dia — beba pelo menos 1 copo agora!' },
    { hour:9,  min:30, title:'💧 Beba água',                   body:'Mantenha o ritmo! Um copo a cada hora faz diferença.' },
    { hour:10, min:30, title:'💧 Hidratação',                  body:'Você está hidratado? Beba água agora, '+nome+'!' },
    { hour:11, min:30, title:'💧 Antes do almoço',             body:'Beba um copo de água 30 min antes do almoço. Ajuda na digestão!' },
    { hour:12, min:0,  title:'🍽️ Hora do almoço!',            body:'Registre seu almoço e acompanhe seus macros.' },
    { hour:13, min:0,  title:'💧 Água pós-almoço',             body:'Beba água após o almoço. Seu metabolismo agradece!' },
    { hour:14, min:0,  title:'💧 Metade do dia!',              body:'Você já atingiu metade da sua meta de água hoje?' },
    { hour:14, min:30, title:'💧 Continue hidratando',         body:'Não pare! Mais alguns copos e você bate a meta do dia.' },
    { hour:15, min:0,  title:'🥗 Lanche da tarde',             body:'Hora do lanche! Que tal algo saudável? Registre no Nutri.k.' },
    { hour:15, min:30, title:'💧 Beba água agora',             body:'A tarde pede hidratação. Tome um copo agora, '+nome+'!' },
    { hour:16, min:30, title:'💧 Não esquece da água!',        body:'Faltam poucas horas. Está perto de bater sua meta hídrica?' },
    { hour:17, min:30, title:'💧 Alerta de hidratação',        body:'Ainda falta água no seu dia? Beba agora antes do jantar!' },
    { hour:18, min:0,  title:'💧 Pré-treino',                  body:'Vai treinar? Hidrate-se bem antes de começar!' },
    { hour:19, min:0,  title:'💧 Água antes do jantar',        body:'Beba um copo de água 20 min antes do jantar.' },
    { hour:19, min:30, title:'🌙 Jantar',                      body:'Hora de registrar o jantar e fechar os macros do dia.' },
    { hour:20, min:30, title:'💧 Último lembrete de água',     body:'Beba mais um copo antes de dormir. Boa noite, '+nome+'!' },
    { hour:21, min:0,  title:'📊 Resumo do dia',               body:'Veja como foi seu dia no Nutri.k. Bom trabalho!' },
  ];

  notifs.forEach(n => {
    const target = new Date();
    target.setHours(n.hour, n.min, 0, 0);
    if(target <= now) target.setDate(target.getDate() + 1);
    const delay = target - now;

    const timer = setTimeout(() => {
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: '/nutrik/icons/icon-192.png',
        badge: '/nutrik/icons/icon-72.png',
        vibrate: [200, 100, 200],
        tag: 'nutrik-'+n.hour+'-'+n.min,
        renotify: true,
        data: { url: '/nutrik/' }
      });
    }, delay);

    self._notifTimers.push(timer);
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/nutrik/'));
});
