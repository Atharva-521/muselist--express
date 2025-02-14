// lib/authUtils.js
const { prismaClient } = require('./db');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secret';

/**
 * Registers a new user.
 * Throws an error if the user already exists.
 */
async function registerUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await prismaClient.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  return user;
}

/**
 * Logs in a user by verifying the email and password.
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prismaClient.user.findUnique({
    where: { email }
  });
  if (!user) {
    throw new Error("User not found");
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }
  
  return user;
}

/**
 * Generates a JWT token for the given user.
 */
function generateJWT(user) {
  return sign({ userId: user.id }, secret, { expiresIn: "30d" });
}

module.exports = { registerUser, loginUser, generateJWT };
