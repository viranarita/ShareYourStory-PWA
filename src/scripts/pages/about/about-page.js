export default class AboutPage {
  async render() {
    return `
      <section class="container about-page">
        <h1>Tentang Proyek Ini</h1>
        <p>
          Selamat datang di platform Berbagi Cerita kami! Ini adalah tempat di mana Anda dapat membagikan momen berkesan dan menemukan cerita dari orang lain, yang semuanya ditandai pada lokasinya di peta dunia yang interaktif.
        </p>
        
        <h2>Fitur Utama Kami</h2>
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-emoji">🗺️</span>
            <h4><strong>Peta Interaktif</strong></h4>
            <p>Jelajahi cerita secara visual. Arahkan kursor ke sebuah cerita dalam daftar untuk melihat lokasinya disorot di peta!</p>
          </div>
          <div class="feature-card">
            <span class="feature-emoji">➕</span>
            <h4><strong>Bagikan Momen Anda</strong></h4>
            <p>Tambahkan cerita Anda sendiri dengan mudah, lengkap dengan deskripsi, foto, dan cukup dengan mengklik lokasi di peta.</p>
          </div>
          <div class="feature-card">
            <span class="feature-emoji">📹</span>
            <h4><strong>Ambil Gambar Langsung dari Kamera</strong></h4>
            <p>Belum punya foto? Anda bisa mengabadikan momen secara langsung dari kamera perangkat Anda.</p>
          </div>
          <div class="feature-card">
            <span class="feature-emoji">📱</span>
            <h4><strong>Modern & Aksesibel</strong></h4>
            <p>Nikmati pengalaman yang lancar di perangkat apa pun, berkat desain yang responsif dan teknologi web modern.</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
  }
}