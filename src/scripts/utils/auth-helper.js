const AUTH_TOKEN_KEY = 'authToken';
const USER_NAME_KEY = 'userName';

const AuthHelper = {
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUserName: () => {
    return localStorage.getItem(USER_NAME_KEY);
  },
  
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  },
};

export default AuthHelper;