// services/downvoteService.js
const { prismaClient } = require('../lib/db');

class DownvoteService {
  async removeUpvote(userId, streamId) {
    // Delete the upvote based on the unique (userId, streamId) combination.
    // Note: This assumes that your Prisma schema defines a unique composite key named userId_streamId.
    return await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: userId,
          streamId: streamId,
        },
      },
    });
  }
}

module.exports = DownvoteService;
