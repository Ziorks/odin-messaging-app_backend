const { body } = require("express-validator");
const db = require("../db/queries");

const existsMessage = " is required";

const validateRegister = [
  body("username")
    .exists({ values: "undefined" })
    .withMessage("'username'" + existsMessage)
    .bail()
    .trim()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long")
    .bail()
    .custom(async (value) => {
      const user = await db.getUserByUsername(value);
      if (user) {
        throw new Error("Username is taken");
      }
    }),
  body("password")
    .exists()
    .withMessage("'password'" + existsMessage)
    .bail()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirmation")
    .exists()
    .withMessage("'passwordConfirmation'" + existsMessage)
    .bail()
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation doesn't match"),
];

module.exports = { validateRegister };
