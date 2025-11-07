// src/scripts/pages/favorite/favorite-page.js

import IdbHelper from '../../utils/idb-helper';
import AuthHelper from '../../utils/auth-helper';

class FavoritePage {
  #allFavoriteStories = []; // Simpan data asli di sini

  async render() {
    return `
      <section class="container">
        <h1>Cerita Favorit Anda</h1>
        
        <div class="search-container form-group">
          <label for="search-favorite">Cari Cerita Favorit</label>
          <input id="search-favorite" type="search" placeholder="Ketik nama atau deskripsi...">
        </div>
        
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    // Cek jika user login
    if (!AuthHelper.isAuthenticated()) {
      const storyListContainer = document.querySelector('#story-list');
      storyListContainer.innerHTML = `
        <div class="guest-view-prompt-fullwidth text-center">
            <h2>Login Dibutuhkan</h2>
            <p>Silakan login untuk melihat daftar favorit Anda.</p>
            <a href="#/login" class="login-prompt-button">Login Sekarang</a>
        </div>
      `;
      return;
    }

    // Ambil data dari IndexedDB (READ)
    // 1. Simpan data asli ke variabel private
    this.#allFavoriteStories = await IdbHelper.getAllFavorites();
    
    // 2. Tampilkan semua cerita saat pertama kali dimuat
    this._displayStories(this.#allFavoriteStories);

    // 3. Tambahkan listener untuk search bar
    const searchInput = document.querySelector('#search-favorite');
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      this._performSearch(query);
    });
    
    // === KODE DUPLIKAT DIHAPUS DARI SINI ===
  }

  // --- FUNGSI BARU UNTUK SEARCH ---
  _performSearch(query) {
    let filteredStories = this.#allFavoriteStories;

    // Jika ada query, filter datanya
    if (query) {
      filteredStories = this.#allFavoriteStories.filter(story => 
        story.name.toLowerCase().includes(query) || 
        story.description.toLowerCase().includes(query)
      );
    }
    
    // Tampilkan hasil filter
    this._displayStories(filteredStories);
  }

  // --- FUNGSI BARU UNTUK MENAMPILKAN CERITA ---
  // (Ini adalah kode duplikat yang kamu pindahkan)
  _displayStories(stories) {
    const storyListContainer = document.querySelector('#story-list');
    storyListContainer.innerHTML = ''; // Kosongkan dulu

    if (stories.length === 0) {
      storyListContainer.innerHTML = '<p class="stories-empty">Anda belum memiliki cerita favorit atau tidak ada hasil pencarian.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyElement = this._createStoryElement(story);
      storyListContainer.appendChild(storyElement);
    });
  }

  // Fungsi ini membuat kartu cerita, tapi dengan tombol "Hapus"
  _createStoryElement(story) {
    const storyElement = document.createElement('article');
    storyElement.classList.add('story-item');
    storyElement.id = `story-${story.id}`;
    
    storyElement.innerHTML = `
      <img class="story-item__image" src="${story.photoUrl}" alt="Gambar cerita oleh ${story.name}">
      <div class="story-item__content">
        <div class="story-item__header">
          <h3 class="story-item__name">${story.name}</h3>
          <p class="story-item__date">${this._formatDate(story.createdAt)}</p> 
        </div>
        <p class="story-item__description">${story.description}</p>
        
        <button 
          class="delete-button" 
          aria-label="Hapus dari favorit" 
          data-story-id="${story.id}">
          Hapus
        </button>
      </div>
    `;

    // Tambahkan event listener untuk tombol Hapus (DELETE)
    const deleteButton = storyElement.querySelector('.delete-button');
    deleteButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      
      // 1. Hapus dari IndexedDB
      await IdbHelper.deleteFavorite(story.id);
      
      // 2. Hapus dari data di memori
      this.#allFavoriteStories = this.#allFavoriteStories.filter(s => s.id !== story.id);
      
      // 3. Tampilkan ulang daftar (atau cari ulang jika ada query)
      const query = document.querySelector('#search-favorite').value.toLowerCase();
      this._performSearch(query);

      alert('Cerita dihapus dari favorit!');
    });
    
    return storyElement;
  }

  _formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }
}

export default FavoritePage;