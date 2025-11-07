import { openDB } from 'idb';

const DATABASE_NAME = 'berbagi-cerita-db';
const DATABASE_VERSION = 2;

const STORE_FAVORITES = 'favorites';
const STORE_OUTBOX = 'outbox'; 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database, oldVersion) {
    
    if (oldVersion < 1) {
      database.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
    }
    
    if (oldVersion < 2) {
      database.createObjectStore(STORE_OUTBOX, { keyPath: 'id', autoIncrement: true });
    }
  },
});

const IdbHelper = {
  
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