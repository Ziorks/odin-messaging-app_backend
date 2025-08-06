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

async function getUserWithProfileById(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: {
        omit: { userId: true },
      },
    },
    omit: {
      password: true,
    },
  });

  return user;
}

async function getAllUsers({ search = "", page = 1, resultsPerPage = 10 }) {
  const count = await prisma.user.count({
    where: {
      username: {
        mode: "insensitive",
        contains: search,
      },
    },
  });
  const users = await prisma.user.findMany({
    skip: (page - 1) * resultsPerPage,
    take: resultsPerPage,
    where: {
      username: {
        mode: "insensitive",
        contains: search,
      },
    },
    include: {
      profile: {
        omit: { userId: true },
      },
    },
    omit: { password: true },
  });

  return { count, users };
}

async function getProfileById(profileId) {
  const profile = await prisma.profile.findUnique({
    where: {
      id: profileId,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
    omit: {
      userId: true,
    },
  });

  return profile;
}

async function getProfileByUserId(userId) {
  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
    omit: {
      userId: true,
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
    include: {
      messages: {
        omit: {
          threadId: true,
        },
        orderBy: { createdAt: "asc" },
      },
      participants: {
        omit: { password: true },
        include: {
          profile: {
            omit: { userId: true },
          },
        },
      },
    },
  });

  return thread;
}

async function getThreadByParticipantIds(participantIds) {
  if (participantIds.length === 0) return null;

  const threads = await prisma.thread.findMany({
    where: {
      participants: { every: { id: { in: participantIds } } },
    },
    include: { participants: true },
  });

  const filteredThreads = threads.filter(
    (thread) => thread.participants.length === participantIds.length
  );
  return filteredThreads[0] || null;
}

async function getAllThreads({
  userId,
  search = "",
  page = 1,
  resultsPerPage = 10,
}) {
  const where = {
    OR: [
      {
        AND: [
          { participants: { every: { id: userId } } },
          {
            participants: {
              some: {
                username: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      },
      {
        AND: [
          { participants: { some: { id: userId } } },
          {
            participants: {
              some: {
                username: { contains: search, mode: "insensitive" },
                id: { not: userId },
              },
            },
          },
        ],
      },
    ],
    messages: {
      some: { id: { gt: 0 } },
    },
  };

  const count = await prisma.thread.count({
    where,
  });

  const threads = await prisma.thread.findMany({
    skip: (page - 1) * resultsPerPage,
    take: resultsPerPage,
    where,
    include: {
      participants: {
        where: { id: { not: userId } },
        omit: { password: true },
        include: {
          profile: {
            select: {
              lastActive: true,
              pictureURL: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          body: true,
          createdAt: true,
        },
      },
    },
  });

  return { count, threads };
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

async function createThread(participantIds) {
  const idsForConnect = participantIds.map((id) => ({ id }));
  const thread = await prisma.thread.create({
    data: {
      participants: {
        connect: idsForConnect,
      },
    },
  });

  return thread;
}

async function updateUserAndProfile(
  userId,
  { username, password, about, pictureURL, picturePublicId }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      password,
      profile: {
        update: {
          about,
          pictureURL,
          picturePublicId,
        },
      },
    },
  });

  return user;
}

async function updateProfile(
  profileId,
  { about, lastActive, pictureURL, picturePublicId }
) {
  const profile = await prisma.profile.update({
    where: {
      id: profileId,
    },
    data: {
      about,
      lastActive,
      pictureURL,
      picturePublicId,
    },
  });

  return profile;
}

async function updateMessage(messageId, { body }) {
  const message = await prisma.message.update({
    where: {
      id: messageId,
    },
    data: {
      body,
      isEdited: true,
    },
  });

  return message;
}

async function deleteMessage(messageId) {
  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });
}

module.exports = {
  getUserById,
  getUserByUsername,
  getUserWithProfileById,
  getAllUsers,
  getProfileById,
  getProfileByUserId,
  getMessageById,
  getThreadById,
  getThreadByParticipantIds,
  getAllThreads,
  createUser,
  createMessage,
  createThread,
  updateUserAndProfile,
  updateProfile,
  updateMessage,
  deleteMessage,
};
