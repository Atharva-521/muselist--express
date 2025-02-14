// controllers/streamController.js
const StreamService = require('../services/streamService');
const { z } = require('zod');

// Import the regex utility for YouTube URLs
const { YT_REGEX } = require('../lib/utils');

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() // Restrict URL to contain YouTube (or Spotify, if extended later)
  });

  const upvoteSchema = z.object({
    streamId: z.string()
  });

class StreamController {
  constructor() {
    this.streamService = new StreamService();
  }

  async getMyStreams(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Unauthenticated" });
      }

      // Retrieve streams and activeStream concurrently
      const { streams, activeStream } = await this.streamService.getMyStreams(user.id);

      // Map streams to include upvoteCount and haveUpvoted flags
      const mappedStreams = streams.map(({ _count, upvotes, ...rest }) => ({
        ...rest,
        upvoteCount: _count.upvotes,
        haveUpvoted: upvotes.length > 0,
      }));

      return res.status(200).json({ streams: mappedStreams, activeStream });
    } catch (error) {
      console.error("Error in getMyStreams:", error);
      return res.status(500).json({ message: "Error fetching streams" });
    }
  }

  async getNextStream(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Unauthenticated" });
      }

      // Retrieve the next stream based on the most upvotes
      const stream = await this.streamService.getNextStream(user.id);
      return res.status(200).json({ stream });
    } catch (error) {
      console.error("Error in getNextStream:", error);
      return res.status(500).json({ message: "Error retrieving next stream" });
    }
  }

  async getUpvote(req, res) {
    try {
      const user = req.user;
      const data = upvoteSchema.parse(req.body);
      if (!user) {
        return res.status(403).json({ message: "Unauthenticated" });
      }
      console.log("user", req);
      // Perform the upvote logic using the service
      const stream = await this.streamService.upvoteStream(user.id, data.streamId);
      return res.status(200).json({ stream });
    } catch (error) {
      console.error("Error in getUpvote:", error);
      return res.status(500).json({ message: "Error processing upvote" });
    }
  }

  async createStream(req, res) {
    try {
      // Validate the incoming JSON body
      const data = CreateStreamSchema.parse(req.body);
      const isYt = data.url.match(YT_REGEX);
      
      if (!isYt) {
        return res.status(411).json({ message: "Wrong url format" });
      }

      // Extract the video ID from the YouTube URL
      const extractedId = data.url.split("?v=")[1];
      
      // Delegate to the service to create the stream
      const stream = await this.streamService.createStream(data.creatorId, data.url, extractedId);
      
      return res.status(200).json({ ...stream, hasUpvoted: false, upvotes: 0 });
    } catch (error) {
      console.error("Error creating stream:", error.message);
      return res.status(411).json({ message: "Error while adding a stream" });
    }
  }

  async getStreams(req, res) {
    try {
      const creatorId = req.query.creatorId;
      // Use the authenticated user from the middleware
      const user = req.user;
      
      if (!user) {
        return res.status(403).json({ message: "Unauthenticated" });
      }
      if (!creatorId) {
        return res.status(411).json({ message: "Error: creatorId is required" });
      }

      const { streams, activeStream } = await this.streamService.getStreams(creatorId, user.id);
      
      // Map streams to add upvoteCount and haveUpvoted flags
      const mappedStreams = streams.map(({ _count, ...rest }) => ({
        ...rest,
        upvoteCount: _count.upvotes,
        haveUpvoted: rest.upvotes.length > 0
      }));
      
      return res.status(200).json({ streams: mappedStreams, activeStream });
    } catch (error) {
      console.error("Error fetching streams:", error.message);
      return res.status(500).json({ message: "Error retrieving streams" });
    }
  }

}

module.exports = StreamController;
