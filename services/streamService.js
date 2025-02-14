// services/streamService.js
const { prismaClient } = require('../lib/db');
const youtubesearchapi = require('youtube-search-api');
const { z } = require('zod');



class StreamService {
  async getMyStreams(userId) {
    const [streams, activeStream] = await Promise.all([
      prismaClient.stream.findMany({
        where: {
          userId: userId,
          played: false,
        },
        include: {
          _count: {
            select: { upvotes: true },
          },
          upvotes: {
            where: {
              userId: userId,
            },
          },
        },
      }),
      prismaClient.currentStream.findFirst({
        where: { userId: userId },
        include: { stream: true },
      }),
    ]);

    return { streams, activeStream };
  }

  async getNextStream(userId) {
    // Find the most upvoted stream for this user that hasn't been played yet.
    const mostUpvotedStream = await prismaClient.stream.findFirst({
      where: {
        userId: userId,
        played: false
      },
      orderBy: {
        upvotes: {
          _count: 'desc'
        }
      }
    });

    console.log("Most upvoted stream ID:", mostUpvotedStream?.id);

    // Concurrently upsert the current stream and mark the stream as played.
    await Promise.all([
      prismaClient.currentStream.upsert({
        where: { userId: userId },
        update: {
          userId: userId,
          streamId: mostUpvotedStream?.id
        },
        create: {
          userId: userId,
          streamId: mostUpvotedStream?.id
        }
      }),
      prismaClient.stream.update({
        where: {
          id: mostUpvotedStream?.id ?? ""
        },
        data: {
          played: true,
          playedTs: new Date()
        }
      })
    ]);

    return mostUpvotedStream;
  }

  async upvoteStream(userId, streamId) {
    // Find the most upvoted stream for the user that hasn't been played yet.
    console.log("ID : ", userId);
    const response = await prismaClient.upvote.create({
      data: {
        userId: userId,
        streamId: streamId
      }
    });

    return response;
  }

  async createStream(creatorId, url, extractedId) {
    console.log('creator id : ', creatorId);
    // Get video details from the YouTube API
    const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
    const thumbnails = videoDetails.thumbnail.thumbnails;
    
    // Sort thumbnails by width (ascending order)
    thumbnails.sort((a, b) => (a.width < b.width ? -1 : 1));
    
    // Create the stream record in the database
    const stream = await prismaClient.stream.create({
      data: {
        userId: creatorId,
        url: url,
        extractedId: extractedId,
        type: "Youtube",
        title: videoDetails.title ?? 'cant find video',
        bigImg: thumbnails[thumbnails.length - 1].url ?? "",
        smallImg: thumbnails.length > 1
          ? thumbnails[thumbnails.length - 2].url
          : thumbnails[thumbnails.length - 1].url ?? ""
      }
    });
    return stream;
  }

  async getStreams(creatorId, currentUserId) {
    // Fetch streams for the given creator where they have not been played
    const [streams, activeStream] = await Promise.all([
      prismaClient.stream.findMany({
        where: {
          userId: creatorId,
          played: false
        },
        include: {
          _count: {
            select: { upvotes: true }
          },
          upvotes: {
            where: { userId: currentUserId }
          }
        }
      }),
      prismaClient.currentStream.findFirst({
        where: { userId: creatorId },
        include: { stream: true }
      })
    ]);
    return { streams, activeStream };
  }

}

module.exports = StreamService;
