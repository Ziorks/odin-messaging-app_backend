const { validationResult } = require("express-validator");
const { validateThreadFindOrCreate } = require("../utilities/validators");
const db = require("../db/queries");

const threadSearchGet = async (req, res) => {
  let { search, page, resultsPerPage } = req.query;
  if (page) {
    page = +page;
  }
  if (resultsPerPage) {
    resultsPerPage = +resultsPerPage;
  }
  const results = await db.getAllThreads({
    userId: req.user.id,
    search,
    page,
    resultsPerPage,
  });

  for (thread of results.threads) {
    if (thread.participants.length === 0) {
      const currentUser = await db.getUserWithProfileById(req.user.id);
      delete currentUser.profile.id;
      delete currentUser.profile.about;
      delete currentUser.profile.createdAt;
      thread.participants.push(currentUser);
      break;
    }
  }

  results.threads = results.threads.sort(
    (a, b) =>
      new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
  );

  return res.json({ results });
};

const threadFindOrCreatePost = [
  validateThreadFindOrCreate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }
    const { recipientIds } = req.body;

    //make sure all ids are valid
    const results = await Promise.all(
      recipientIds.map(async (userId) => {
        const user = await db.getUserById(userId);
        return { userId, valid: !!user };
      })
    );
    const invalidUserIds = results.filter((r) => !r.valid).map((r) => r.userId);
    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        message: "validation failed",
        errors: [
          {
            msg: `The userIds '${invalidUserIds.join(", ")}' are invalid `,
          },
        ],
      });
    }

    const participantIds = [...new Set([req.user.id, ...recipientIds])];

    let thread = await db.getThreadByParticipantIds(participantIds);
    if (!thread) {
      thread = await db.createThread(participantIds);
    }

    return res.json({ thread });
  },
];

const threadGet = async (req, res) => {
  const { threadId } = req.params;
  const thread = await db.getThreadById(+threadId);
  if (!thread) {
    return res.status(404).json({ message: "thread not found" });
  }
  const isUserParticipant = thread.participants.find(
    (participant) => participant.id === req.user.id
  );
  if (!isUserParticipant) {
    return res
      .status(403)
      .json({ message: "you are not a participant of this thread" });
  }

  return res.json({ thread });
};

module.exports = {
  threadSearchGet,
  threadFindOrCreatePost,
  threadGet,
};
