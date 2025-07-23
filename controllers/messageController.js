const db = require("../db/queries");
const { validationResult } = require("express-validator");
const { validateMessage } = require("../utilities/validators");
const { localizeMessage } = require("../middleware");

const messageCreate = [
  validateMessage,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "request body validation failed",
        errors: errors.array(),
      });
    }

    const { body, threadId } = req.body;
    const thread = await db.getThreadById(threadId);
    const isSenderParticipant = thread.participants.find(
      (participant) => participant.id === req.user.id
    );
    if (!isSenderParticipant) {
      return res
        .status(403)
        .json({ message: "you are not a participant in this thread" });
    }
    await db.createMessage({ body, senderId: req.user.id, threadId });

    return res.json({ message: "message created" });
  },
];

const messageGet = [
  localizeMessage,
  async (req, res) => {
    const { message } = res.locals;

    return res.json({ message });
  },
];

const messageUpdate = [
  localizeMessage,
  async (req, res) => {
    //TODO: add validation
    const { body } = req.body;
    const { message } = res.locals;
    await db.updateMessage(message.id, { body });

    return res.json({ message: "message updated" });
  },
];

const messageDelete = [
  localizeMessage,
  async (req, res) => {
    const { message } = req.locals;
    await db.deleteMessage(message.id);

    return res.json({ message: "message deleted" });
  },
];

module.exports = { messageCreate, messageGet, messageUpdate, messageDelete };
