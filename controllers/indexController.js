const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { validateRegister } = require("../utilities/validators");
const db = require("../db/queries");
const { isLoggedIn } = require("../middleware");

const loginPost = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "login failed", error: info.message });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "login successful" });
    });
  })(req, res, next);
};

const registerPost = [
  validateRegister,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await db.getUserByUsername(username);
    if (user) {
      return res.status(400).json({
        message: "validation failed",
        errors: [{ msg: "Username is taken" }],
      });
    }

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      try {
        await db.createUser({ username, hashedPassword });
        return res.json({ message: "registration was successful" });
      } catch (err) {
        return next(err);
      }
    });
  },
];

const logoutGet = [
  isLoggedIn,
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "logout successful" });
    });
  },
];

module.exports = { loginPost, registerPost, logoutGet };
