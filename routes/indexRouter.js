const { Router } = require("express");
const {
  loginPost,
  registerPost,
  logoutGet,
} = require("../controllers/indexController");

const router = Router();

router.post("/login", loginPost);
router.post("/register", registerPost);
router.get("/logout", logoutGet);

module.exports = router;
