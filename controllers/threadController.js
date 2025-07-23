const db = require("../db/queries");

const threadSearchGet = async (req, res) => {
  //TODO: validate body?
  const { search } = req.body;
  const threads = await db.getAllThreads({ userId: req.user.id, search });

  return res.json({ threads });
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
