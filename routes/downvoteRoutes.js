// routes/downvoteRoutes.js
const express = require("express");
const router = express.Router();
const DownvoteController = require('../controllers/downvoteController');

const downvoteController = new DownvoteController();

// Map POST /streams/downvote to the downvote method
router.post('/', (req, res) => downvoteController.downvote(req, res));

module.exports = router;
