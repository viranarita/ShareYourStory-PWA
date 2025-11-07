import { loginUser } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container form-page-container">
        <h2>Login</h2>
        <form id="login-form" class="login-form" novalidate>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="submit-button">Login</button>
          <p class="auth-switch">Belum punya akun? <a href="#/register">Register di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const loginResult = await loginUser({ email, password });
        localStorage.setItem('authToken', loginResult.token);
        localStorage.setItem('userName', loginResult.name);
        
        window.location.hash = '#/';
        window.location.reload();
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