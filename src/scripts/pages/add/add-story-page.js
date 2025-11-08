import { addNewStory } from '../../data/api';
import IdbHelper from '../../utils/idb-helper';

export default class AddStoryPage {
  #cameraStream = null;

  async render() {
    return `
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        <form id="add-story-form" class="add-story-form" novalidate>
          
          <div class="form-group">
            <label for="story-description">Deskripsi:</label>
            <textarea id="story-description" name="description" rows="4" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="story-photo">Gambar:</label>
            <input type="file" id="story-photo" name="photo" accept="image/*" required>
            <button type="button" id="camera-button" class="camera-button">Ambil dari Kamera</button>
          </div>

          <div id="camera-container" class="camera-container" style="display: none;">
            <video id="camera-preview" autoplay></video>
            <button type="button" id="capture-button" class="capture-button" aria-label="Ambil Foto"></button>
            <button type="button" id="close-camera-button" class="close-camera-button" aria-label="Tutup Kamera">X</button>
          </div>
          <canvas id="photo-canvas" style="display: none;"></canvas>

          <div class="form-group">
            <label for="map-add">Pilih Lokasi di Peta:</label>
            <div id="map-add"></div>
            <input type="hidden" id="latitude" name="lat">
            <input type="hidden" id="longitude" name="lon">
          </div>
          <button type="submit" id="submit-button" class="submit-button">Bagikan Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this._initializeMap();
    this._initializeFormSubmit();
    this._initializeCamera();
  }

  _initializeMap() {
    const map = L.map('map-add').setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const latInput = document.querySelector('#latitude');
    const lonInput = document.querySelector('#longitude');
    let marker;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latInput.value = lat;
      lonInput.value = lng;
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker([lat, lng]).addTo(map);
    });
  }

  _initializeFormSubmit() {
    const addStoryForm = document.querySelector('#add-story-form');
    const submitButton = document.querySelector('#submit-button');

    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const description = document.querySelector('#story-description').value;
      const photo = document.querySelector('#story-photo').files[0];
      const lat = document.querySelector('#latitude').value;
      const lon = document.querySelector('#longitude').value;

      if (!description || !photo) {
        this._showFeedback('Deskripsi dan gambar harus diisi.', 'error');
        return;
      }
      
      submitButton.disabled = true;
      submitButton.innerText = 'Mengirim...';

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }
      
      try {
        this._showFeedback('Mencoba mengirim cerita...', 'info');
        const response = await addNewStory(formData);
        if (response.error) {
          throw new Error(response.message);
        }
        
        this._showFeedback('Cerita berhasil ditambahkan! (Online)', 'success');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);

      } catch (error) {
        console.error('Gagal mengirim ke API, menyimpan ke Outbox:', error.message);
        this._showFeedback('Gagal mengirim. Cerita disimpan di Outbox.', 'info');
        
        const storyData = { description, photo, lat, lon };
        await IdbHelper.addStoryToOutbox(storyData);
        
        this._showFeedback('Cerita akan dikirim otomatis saat kembali online.', 'success');
        addStoryForm.reset();
      }

      submitButton.disabled = false;
      submitButton.innerText = 'Bagikan Cerita';
    });
  }

  _initializeCamera() {
    const cameraButton = document.querySelector('#camera-button');
    const captureButton = document.querySelector('#capture-button');
    const closeCameraButton = document.querySelector('#close-camera-button');

    cameraButton.addEventListener('click', () => this._openCamera());
    captureButton.addEventListener('click', () => this._capturePhoto());
    closeCameraButton.addEventListener('click', () => this._closeCamera());
  }

  async _openCamera() {
    const cameraContainer = document.querySelector('#camera-container');
    const videoElement = document.querySelector('#camera-preview');
    cameraContainer.style.display = 'block';

    try {
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = this.#cameraStream;
    } catch (error) {
      console.error('Error mengakses kamera:', error);
      this._showFeedback('Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.', 'error');
      cameraContainer.style.display = 'none';
    }
  }

  _capturePhoto() {
    const canvas = document.querySelector('#photo-canvas');
    const video = document.querySelector('#camera-preview');
    const fileInput = document.querySelector('#story-photo');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      this._showFeedback('Foto berhasil diambil dari kamera!', 'success');
      this._closeCamera();
    }, 'image/jpeg');
  }

  _closeCamera() {
    const cameraContainer = document.querySelector('#camera-container');
    cameraContainer.style.display = 'none';

    if (this.#cameraStream) {
      this.#cameraStream.getTracks().forEach(track => track.stop());
      this.#cameraStream = null;
    }
  }

_showFeedback(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast--${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--show');
    }, 10);
  
    setTimeout(() => {
      toast.classList.remove('toast--show');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3000);
  }
}