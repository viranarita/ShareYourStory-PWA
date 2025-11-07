import AuthHelper from '../utils/auth-helper';

class HomePagePresenter {
    #view = null;
    #api = null;
  
    constructor({ view, api }) {
      this.#view = view;
      this.#api = api;
      this.#start();
    }

    #start() {
      if (!AuthHelper.isAuthenticated()) {
        const message = 'Silakan <strong>Login</strong> untuk melihat daftar cerita dari pengguna lain.';
        this.#view.displayGuestMessage(message); 
        return;
      }
      this.#showStories();
    }

    async #showStories() {
      try {
        const stories = await this.#api.fetchAllStories();
        this.#view.displayStories(stories);
      } catch (error) {
        this.#view.displayError(error.message);
      }
    }
}
  
export default HomePagePresenter;