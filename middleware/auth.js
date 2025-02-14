// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // For example, extract a user ID from a custom header.
    // In a real-world scenario, verify a token or session.
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: "Unauthenticated" });
    }
    const token = authHeader.split(' ')[1];
    // Decode the token to extract the user ID
    let userId;
    try {
        const decoded = jwt.verify(token, 'secret'); // Replace 'your-secret-key' with your actual secret
        userId = decoded.userId; // Assuming the user ID is stored in the 'id' field of the token
        console.log('decoded : ', decoded);
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
    // Optionally, you could retrieve the full user from your DB.
    // Here we simply attach a user object with an id.
    req.user = { id: userId };
    next();
  };