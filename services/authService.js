// services/authService.js
const { registerUser, loginUser, generateJWT } = require('../lib/authUtils');

class AuthService {
  async register({ email, password }) {
    const user = await registerUser({ email, password });
    return user;
  }

  async login({ email, password }) {
    const user = await loginUser({ email, password });
    return user;
  }

  generateToken(user) {
    return generateJWT(user);
  }
}

module.exports = AuthService;
