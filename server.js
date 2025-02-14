// server.js
const express = require('express');
const cors = require('cors');
const app = express();


app.use(express.json());

app.use(cors());

// Attach authentication middleware for protected routes
const authMiddleware = require('./middleware/auth');

// Mount the stream routes under /streams (all routes will be protected)
const streamRoutes = require('./routes/streamRoutes');
app.use('/streams', authMiddleware, streamRoutes);


// Mount the auth routes under /auth
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
