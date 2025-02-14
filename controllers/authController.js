// controllers/authController.js
const AuthService = require('../services/authService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/register
   * Expects a JSON body: { email, password }
   */
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await this.authService.register({ email, password });
      const token = await this.authService.generateToken(user);
      console.log("Registered user:", user);
      console.log("Generated token:", token);
      return res.status(201).send({ user, accessToken: token });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: error.message || "Registration error" });
    }
  }

  /**
   * POST /auth/login
   * Expects a JSON body: { email, password }
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await this.authService.login({ email, password });
      const token = this.authService.generateToken(user);
      return res.status(200).json({ user, accessToken: token });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: error.message || "Login error" });
    }
  }
}

module.exports = AuthController;
