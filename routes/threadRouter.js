const { Router } = require("express");
const { isLoggedIn } = require("../middleware");
const {
  threadSearchGet,
  threadPost,
  threadGet,
} = require("../controllers/threadController");

const router = Router();

router.use(isLoggedIn);

router.route("/").get(threadSearchGet).post(threadPost);
router.get("/:threadId", threadGet);

module.exports = router;
