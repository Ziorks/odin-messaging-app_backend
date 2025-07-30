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

  const currentUser = await db.getUserWithProfileById(req.user.id);
  delete currentUser.profile.id;
  delete currentUser.profile.about;
  delete currentUser.profile.createdAt;

  results.threads = results.threads.sort((a, b) => {
    if (a.participants.length === 0) {
      a.participants.push(currentUser);
    }
    if (b.participants.length === 0) {
      b.participants.push(currentUser);
    }
    return (
      new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
    );
  });

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
  await db.createThread([req.user.id, userId]);

  return res.json({ message: "thread created" });
};

const threadFindOrCreatePost = async (req, res) => {
  //TODO: validate body
  // exists
  // are real ids
  const { recipientIds } = req.body;
  const participantIds = [...new Set([req.user.id, ...recipientIds])];

  let thread = await db.getThreadByParticipantIds(participantIds);
  if (!thread) {
    thread = await db.createThread(participantIds);
  }

  return res.json({ thread });
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

module.exports = {
  threadSearchGet,
  threadPost,
  threadFindOrCreatePost,
  threadGet,
};
