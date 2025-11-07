import IdbHelper from '../../utils/idb-helper';

class HomePage {
  #map = null;
  #markers = {};
  
  async render() {
    return `
      <section id="home-page-content"></section>
    `;
  }
  
  initializeMap() {
    const mapContainer = document.querySelector('#map');
    if (mapContainer) {
        mapContainer.style.display = 'block';
    }

    this.#map = L.map('map').setView([-2.5489, 118.0149], 5);
    
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });

    const baseMaps = { 'Street': streetLayer, 'Satellite': satelliteLayer };
    L.control.layers(baseMaps).addTo(this.#map);
    streetLayer.addTo(this.#map);
  }

  displayGuestMessage(message) {
    const contentWrapper = document.querySelector('#home-page-content');
    contentWrapper.innerHTML = `
      <div class="guest-view-prompt-fullwidth text-center">
          <h2>👋 Selamat Datang!</h2>
          <p>${message}</p>
          <a href="#/login" class="login-prompt-button">Login Sekarang</a>
      </div>
    `;
  }

  displayStories(stories) {
    const contentWrapper = document.querySelector('#home-page-content');

    contentWrapper.innerHTML = `
      <div class="container">
        <h1>Jelajahi Cerita Pengguna</h1>
        <div id="map"></div>
        <div id="story-list" class="story-list"></div>
      </div>
    `;

    this.initializeMap();

    const storyListContainer = contentWrapper.querySelector('#story-list');
    
    Object.values(this.#markers).forEach(marker => this.#map.removeLayer(marker));
    this.#markers = {};

    if (stories.length === 0) {
      storyListContainer.innerHTML = '<p class="stories-empty">Tidak ada cerita untuk ditampilkan.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyElement = this._createStoryElement(story);
      storyListContainer.appendChild(storyElement);

      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this.#map)
          .bindPopup(`
            <img src="${story.photoUrl}" alt="Gambar cerita oleh ${story.name}" class="popup-image">
            <b>${story.name}</b>
            <br>
            <small>${this._formatDate(story.createdAt)}</small> 
            <hr style="margin: 4px 0;"> 
            ${story.description.substring(0, 30)}...
          `);
        this.#markers[story.id] = marker;

        storyElement.addEventListener('mouseenter', () => marker.openPopup());
        storyElement.addEventListener('mouseleave', () => marker.closePopup());
      }
    });
  }

  displayError(message) {
    const contentWrapper = document.querySelector('#home-page-content');
    contentWrapper.innerHTML = `<div class="container"><p class="stories-empty">❌ Gagal memuat data: ${message}</p></div>`;
  }

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
          class="favorite-button" 
          aria-label="Tambahkan ke favorit" 
          data-story-id="${story.id}">
          ❤️
        </button>
      </div>
    `;
    const favoriteButton = storyElement.querySelector('.favorite-button');
    favoriteButton.addEventListener('click', async (event) => {
      event.stopPropagation(); 
      await IdbHelper.addFavorite(story);
      
      alert('Cerita ditambahkan ke favorit!');
      favoriteButton.disabled = true;
      favoriteButton.innerText = '✅';
    });

    return storyElement;
  }

  
  _formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  
}

export default HomePage;