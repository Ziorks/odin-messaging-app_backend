const db = require("../db/queries");
const { validationResult } = require("express-validator");
const {
  validateMessageCreate,
  validateMessageUpdate,
} = require("../utilities/validators");
const { localizeMessage } = require("../middleware");

const messageCreate = [
  validateMessageCreate,
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
    if (!thread) {
      return res.status(400).json({
        message: "request body validation failed",
        errors: [{ msg: "invalid threadId" }],
      });
    }

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
  validateMessageUpdate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "request body validation failed",
        errors: errors.array(),
      });
    }

    const { message } = res.locals;
    if (message.senderId !== req.user.id) {
      return res.status(403).json({
        message: "you are not authorized to edit a message you didn't create",
      });
    }

    const { body } = req.body;
    await db.updateMessage(message.id, { body });

    return res.json({ message: "message updated" });
  },
];

const messageDelete = [
  localizeMessage,
  async (req, res) => {
    const { message } = res.locals;
    await db.deleteMessage(message.id);

    return res.json({ message: "message deleted" });
  },
];

module.exports = { messageCreate, messageGet, messageUpdate, messageDelete };
