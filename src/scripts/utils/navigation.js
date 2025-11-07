import AuthHelper from './auth-helper';

const renderNav = () => {
  const navDrawer = document.querySelector('#navigationDrawer ul'); 
  const isLoggedIn = AuthHelper.isAuthenticated();
  const userName = AuthHelper.getUserName();

  let navItems = `
    <li><a href="#/">Beranda</a></li>
    <li><a href="#/about">Tentang Kami</a></li>
  `;

  if (isLoggedIn) {
    navItems += `
      <li><a href="#/add">Tambah Cerita</a></li>
      <li><span class="nav-username">Halo, ${userName || 'User'}</span></li>
      <li><a href="#" id="logoutLink" class="nav-logout-btn">Logout</a></li>
    `;
  } else {
    navItems += `
      <li><a href="#/login" class="nav-login-btn">Login</a></li>
    `;
  }
  
  navDrawer.innerHTML = navItems;

  if (isLoggedIn) {
    const logoutLink = document.querySelector('#logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            AuthHelper.logout(); 
            alert('Anda berhasil logout.');
            window.location.hash = '#/';
            window.location.reload(); 
        });
    }
  }
};

export default renderNav;