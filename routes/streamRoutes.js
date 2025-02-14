// routes/streamRoutes.js
const express = require('express');
const router = express.Router();
const StreamController = require('../controllers/streamController');


const streamController = new StreamController();

// GET /streams/my
router.get('/my', (req, res) => streamController.getMyStreams(req, res));
router.get('/next', (req, res) => streamController.getNextStream(req, res));
router.post('/upvote', (req, res) => streamController.getUpvote(req, res));
router.post('/', (req, res) => streamController.createStream(req, res));
router.get('/', (req, res) => streamController.getStreams(req, res));

module.exports = router;
