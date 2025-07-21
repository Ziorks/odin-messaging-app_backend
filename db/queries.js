const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

async function getUserByUsername(username) {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  return user;
}

async function getProfileById(profileId) {
  const profile = await prisma.profile.findUnique({
    where: {
      id: profileId,
    },
  });

  return profile;
}

async function getProfileByUserId(userId) {
  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  return profile;
}

async function getMessageById(messageId) {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  return message;
}

async function getThreadById(threadId) {
  const thread = await prisma.thread.findUnique({
    where: {
      id: threadId,
    },
  });

  return thread;
}

async function createUser({ username, hashedPassword }) {
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      profile: {
        create: {},
      },
    },
  });

  return user;
}

async function createMessage({ body, senderId, threadId }) {
  const message = await prisma.message.create({
    data: {
      body,
      sender: {
        connect: { id: senderId },
      },
      thread: {
        connect: { id: threadId },
      },
    },
  });

  return message;
}

async function createThread({ userId1, userId2 }) {
  const thread = await prisma.thread.create({
    data: {
      participants: {
        connect: [{ id: userId1 }, { id: userId2 }],
      },
    },
  });

  return thread;
}

async function updateProfile(profileId, { about, lastActive, picture }) {
  const profile = await prisma.profile.update({
    where: {
      id: profileId,
    },
    data: {
      about,
      lastActive,
      picture,
    },
  });

  return profile;
}

module.exports = {
  getUserById,
  getUserByUsername,
  getProfileById,
  getProfileByUserId,
  getMessageById,
  getThreadById,
  createUser,
  createMessage,
  createThread,
  updateProfile,
};
