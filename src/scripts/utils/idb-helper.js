// src/scripts/utils/idb-helper.js

import { openDB } from 'idb';

const DATABASE_NAME = 'berbagi-cerita-db';
const DATABASE_VERSION = 2; // <-- 1. NAIKKAN VERSI DATABASE

const STORE_FAVORITES = 'favorites';
const STORE_OUTBOX = 'outbox'; // <-- 2. NAMA STORE BARU (untuk data tunda)

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database, oldVersion) {
    // 3. LOGIKA UPGRADE DATABASE
    
    // Inisialisasi store 'favorites' (jika ini instalasi pertama)
    if (oldVersion < 1) {
      database.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
    }
    
    // Buat store 'outbox' baru (saat upgrade dari v1 ke v2)
    if (oldVersion < 2) {
      // 'id' akan jadi auto-incrementing key
      database.createObjectStore(STORE_OUTBOX, { keyPath: 'id', autoIncrement: true });
    }
  },
});

// 4. GANTI NAMA EXPORT AGAR LEBIH UMUM
const IdbHelper = {
  
  // --- FAVORITES (Kode yang sudah ada) ---
  async addFavorite(story) {
    return (await dbPromise).put(STORE_FAVORITES, story);
  },
  async getAllFavorites() {
    return (await dbPromise).getAll(STORE_FAVORITES);
  },
  async deleteFavorite(id) {
    return (await dbPromise).delete(STORE_FAVORITES, id);
  },
  async getFavorite(id) {
    if (!id) {
      return;
    }
    return (await dbPromise).get(STORE_FAVORITES, id);
  },

  // --- OUTBOX (Kode baru untuk Kriteria 4 Advanced) ---
  /**
   * Menambahkan cerita ke outbox.
   * 'story' adalah object { description, photo, lat, lon }
   */
  async addStoryToOutbox(story) {
    return (await dbPromise).add(STORE_OUTBOX, story);
  },
  
  async getAllStoriesFromOutbox() {
    return (await dbPromise).getAll(STORE_OUTBOX);
  },
  
  async deleteStoryFromOutbox(id) {
    return (await dbPromise).delete(STORE_OUTBOX, id);
  },
};

export default IdbHelper;