// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const authController = new AuthController();

// Registration endpoint
router.post('/register', (req, res) => authController.register(req, res));

// Login endpoint
router.post('/login', (req, res) => authController.login(req, res));

module.exports = router;
