// controllers/downvoteController.js
const { z } = require("zod");
const DownvoteService = require('../services/downvoteService');

// Define the validation schema using Zod
const DownvoteSchema = z.object({
  streamId: z.string(),
});

class DownvoteController {
  constructor() {
    this.downvoteService = new DownvoteService();
  }

  async downvote(req, res) {
    try {
      // Validate the request body against the schema
      const data = DownvoteSchema.parse(req.body);

      // Assume that authentication middleware sets req.user
      const user = req.user;

      if (!user) {
        return res.status(403).json({ message: "Unauthenticated" });
      }

      // Delegate to the service to remove the upvote
      await this.downvoteService.removeUpvote(user.id, data.streamId);
      return res.status(200).json({ message: "Downvote successful" });
    } catch (error) {
      console.error("Error during downvote:", error);
      return res.status(403).json({ message: "Error while downvoting" });
    }
  }
}

module.exports = DownvoteController;
