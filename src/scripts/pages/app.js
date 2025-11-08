import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';
import AuthHelper from '../utils/auth-helper';
import HomePage from '../pages/home/home-page';
import HomePagePresenter from '../presenters/home-page-presenter';
import * as ApiSource from '../data/api';
import { addNewStory } from '../data/api';
import IdbHelper from '../utils/idb-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    
    this._initialAppShell();
  }

  _initialAppShell() {
    this._setupDrawer();
    this._setupSkipLink();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupSkipLink() {
    const skipLink = document.querySelector('.skip-to-content');
    const mainContent = document.querySelector('#main-content');

    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.setAttribute('tabindex', -1);
        mainContent.focus();
        mainContent.removeAttribute('tabindex');
      });
    }
  }

  async renderPage() {
    if (!document.startViewTransition) {
      await this._updateContent();
      return;
    }
    document.startViewTransition(async () => {
      await this._updateContent();
    });
  }

  async _updateContent() {
    this._updateNavigation();
    
    const url = UrlParser.parseActiveUrlWithCombiner();
    const PageComponent = routes[url] || routes['/'];
    
    if (PageComponent === HomePage) {
      const view = new HomePage();
      this.#content.innerHTML = await view.render();
      new HomePagePresenter({ view, api: ApiSource });
    } else {
      const page = new PageComponent(); 
      this.#content.innerHTML = await page.render();
      if (page.afterRender) {
        await page.afterRender();
      }
    }
  }
  
  _updateNavigation() {
    const navList = document.querySelector('#nav-list'); 
    if (!navList) return; 

    if (AuthHelper.isAuthenticated()) {
      const userName = AuthHelper.getUserName();
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add">Tambah Cerita</a></li>
        <li><a href="#/favorite">Favorit</a></li>
        <li><a href="#/about">About</a></li>
        <li><a id="logout-button" href="#">Logout (${userName})</a></li>
      `;
      const logoutButton = document.querySelector('#logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
          event.preventDefault();
          AuthHelper.logout(); 
          alert('Anda berhasil logout.');
          window.location.hash = '#/login';
          window.location.reload();
        });
      }
    } else {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/login">Login</a></li>
      `;
    }
  }
}

const VAPID_PUBLIC_KEY = 'BC7BY5Cs7SDe_4LGAAWeYyQA1Piu84JKAkYzAV2bG7egw_a6uMWHWqXxGkDxzovLJNXlaegzWoH6ohtnfTFvRsI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function initNotificationToggleButton() {
  const toggleButton = document.getElementById('notification-toggle-button');
  if (!toggleButton) return;
  if (!AuthHelper.isAuthenticated()) {
    toggleButton.style.display = 'none'; // Sembunyikan tombol jika belum login
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  // Atur Teks dan Class saat halaman dimuat
  if (existingSubscription) {
    toggleButton.textContent = 'Disable Notifications';
    toggleButton.classList.add('state-disable');
    toggleButton.classList.remove('state-enable');
  } else {
    toggleButton.textContent = 'Enable Notifications';
    toggleButton.classList.add('state-enable');
    toggleButton.classList.remove('state-disable');
  }
  toggleButton.style.display = 'block';

  toggleButton.addEventListener('click', async () => {
    // Cek berdasarkan class, bukan teks (lebih aman)
    if (toggleButton.classList.contains('state-enable')) {
      
      // 1. Minta izin DULU saat tombol diklik
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied.');
        alert('Anda harus mengizinkan notifikasi untuk mengaktifkannya.');
        return;
      }

      // 2. Baru lakukan subscribe jika izin diberikan
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('Subscribed!', subscription);
        
        toggleButton.textContent = 'Disable Notifications';
        toggleButton.classList.add('state-disable');
        toggleButton.classList.remove('state-enable');
      } catch (err) {
        console.error('Failed to subscribe:', err);
      }
    } else {
      try {
        await existingSubscription.unsubscribe();
        console.log('Unsubscribed!');
        toggleButton.textContent = 'Enable Notifications';
        toggleButton.classList.add('state-enable');
        toggleButton.classList.remove('state-disable');
      } catch (err) { 
        console.error('Failed to unsubscribe:', err);
      }
    }
  });
}

// async function requestNotificationPermission() {
//   const permission = await Notification.requestPermission();
//   if (permission === 'granted') {
//     console.log('Notification permission granted.');
//   } else {
//     console.warn('Notification permission denied.');
//   }
// }

async function swRegister() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker API not supported.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    console.log('Service worker registration succeeded:', registration);

    initNotificationToggleButton();

  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

swRegister();

async function sendOutboxData() {
  console.log('Online! Mencoba mengirim data dari Outbox...');
  const stories = await IdbHelper.getAllStoriesFromOutbox();
  
  if (stories.length === 0) {
    console.log('Outbox kosong.');
    return;
  }

  for (const story of stories) {
    console.log('Mengirim cerita:', story.description);
    
    const formData = new FormData();
    formData.append('description', story.description);
    formData.append('photo', story.photo);
    if (story.lat && story.lon) {
      formData.append('lat', story.lat);
      formData.append('lon', story.lon);
    }
    
    try {
      const response = await addNewStory(formData);
      if (response.error) {
        throw new Error(response.message);
      }
      
      await IdbHelper.deleteStoryFromOutbox(story.id);
      console.log('Cerita (ID:', story.id, ') berhasil dikirim dan dihapus dari outbox.');
      
    } catch (error) {
      console.error('Gagal mengirim cerita (ID:', story.id, '). Tetap di outbox.', error.message);
    }
  }
}

window.addEventListener('online', () => {
  sendOutboxData();
});

if (navigator.onLine) {
  sendOutboxData();
}

export default App;