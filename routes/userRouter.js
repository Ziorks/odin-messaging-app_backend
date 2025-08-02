const { Router } = require("express");
const { isLoggedIn } = require("../middleware");
const {
  userSearchGet,
  currentUserGet,
  currentUserProfileUpdate,
  currentUserPasswordUpdate,
  userGet,
} = require("../controllers/userController");

const router = Router();

router.use(isLoggedIn);

router.get("/", userSearchGet);
router.get("/me", currentUserGet);
router.put("/me/profile", currentUserProfileUpdate);
router.put("/me/password", currentUserPasswordUpdate);
router.get("/:userId", userGet);

module.exports = router;
