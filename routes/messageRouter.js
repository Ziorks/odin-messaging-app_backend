const { Router } = require("express");
const {
  messageCreate,
  messageGet,
  messageUpdate,
  messageDelete,
} = require("../controllers/messageController");
const { isLoggedIn } = require("../middleware");

const router = Router();

router.use(isLoggedIn);

router.post("/", messageCreate);

router
  .route("/:messageId")
  .get(messageGet)
  .put(messageUpdate)
  .delete(messageDelete);

module.exports = router;
