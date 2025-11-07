import { registerUser } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container form-page-container">
        <h2>Register</h2>
        <form id="register-form" class="register-form" novalidate>
          
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" minlength="8" required>
          </div>
          <button type="submit" class="submit-button">Register</button>
          <p class="auth-switch">Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector('#register-form');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      if (password.length < 8) {
        this._showFeedback('Password minimal harus 8 karakter.', 'error');
        return;
      }

      try {
        await registerUser({ name, email, password });
        this._showFeedback('Registrasi berhasil! Mengarahkan ke halaman login...', 'success');
        
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
      } catch (error) {
        this._showFeedback(error.message, 'error');
      }
    });
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