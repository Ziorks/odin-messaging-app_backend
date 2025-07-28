const { Router } = require("express");
const { isLoggedIn } = require("../middleware");
const {
  threadSearchGet,
  threadPost,
  threadFindOrCreatePost,
  threadGet,
} = require("../controllers/threadController");

const router = Router();

router.use(isLoggedIn);

router.route("/").get(threadSearchGet).post(threadPost);
router.post("/find-or-create", threadFindOrCreatePost);
router.get("/:threadId", threadGet);

module.exports = router;
