self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
  
    let data = {};
    if (event.data) {
      data = event.data.json();
    }
  
    const title = data.title || 'Notifikasi Baru';
    const options = {
      body: data.body || 'Ada pesan baru untukmu!',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      data: {
        url: data.url || '/', 
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  