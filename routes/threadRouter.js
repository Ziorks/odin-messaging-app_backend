const { Router } = require("express");
const { isLoggedIn } = require("../middleware");
const {
  threadSearchGet,

  threadFindOrCreatePost,
  threadGet,
} = require("../controllers/threadController");

const router = Router();

router.use(isLoggedIn);

router.route("/").get(threadSearchGet).post(threadFindOrCreatePost);
router.get("/:threadId", threadGet);

module.exports = router;
