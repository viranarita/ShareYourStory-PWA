import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import AddStoryPage from '../pages/add/add-story-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import FavoritePage from '../pages/favorite/favorite-page';

const routes = {
  '/': HomePage,
  '/home': HomePage,
  '/about': AboutPage,
  '/add': AddStoryPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/favorite': FavoritePage,
};

export default routes;