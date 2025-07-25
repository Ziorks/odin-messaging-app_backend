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

  results.threads = results.threads.sort(
    (a, b) =>
      new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
  );

  return res.json({ results });
};

const threadPost = async (req, res) => {
  //TODO: not sure if this is good since you can create multiple threads with same participants but I'm rolling with it for now
  const { userId } = req.body;
  const user = await db.getUserById(userId);
  if (!user) {
    return res
      .status(400)
      .json({ message: "the 'userId' you provided is invalid" });
  }
  await db.createThread({ userId1: req.user.id, userId2: userId });

  return res.json({ message: "thread created" });
};

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

module.exports = { threadSearchGet, threadPost, threadGet };
