const { Router } = require("express");
const { isLoggedIn } = require("../middleware");
const {
  currentUserGet,
  userGet,
  userSearchGet,
} = require("../controllers/userController");

const router = Router();

router.use(isLoggedIn);

router.get("/", userSearchGet);
router.get("/me", currentUserGet);
router.get("/:userId", userGet);

module.exports = router;
