const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); //5MB limit
const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
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

const validateMessage = [
  body("body")
    .exists()
    .withMessage("'body'" + existsMessage)
    .trim()
    .isString()
    .withMessage("'body' must be a string"),
];

const validateProfileUpdate = [
  (req, res, next) => {
    upload.single("picture")(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.fileValidationError = {
            message: "File too large. Max 5MB allowed.",
          };
        } else {
          return next(err);
        }
      }

      return next();
    });
  },
  body("picture")
    .custom((value, { req }) => {
      if (req.fileValidationError) {
        throw new Error(req.fileValidationError.message);
      }

      const picture = req.file;
      if (!picture) return true;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(picture.mimetype)) {
        throw new Error("Only image files are allowed");
      }

      return true;
    })
    .default(
      "https://res.cloudinary.com/dwf29bnr3/image/upload/v1754109878/messaging_app_profile_pics/icsll72wpxwcku6gb1by.jpg"
    ),
  body("about").trim().isString().withMessage("'about' must be a string"),
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
    .custom(async (value, { req }) => {
      const user = await db.getUserByUsername(value);
      if (user.id !== req.user.id) {
        throw new Error("Username is taken");
      }
    }),
];

const validatePasswordUpdate = [
  body("oldPassword")
    .exists()
    .withMessage("'oldPassword'" + existsMessage)
    .bail()
    .trim()
    .custom(async (value, { req }) => {
      const user = await db.getUserById(req.user.id);
      const match = await bcrypt.compare(value, user.password);
      if (!match) {
        throw new Error("oldPassword is incorrect");
      }
    }),
  body("newPassword")
    .exists()
    .withMessage("'newPassword'" + existsMessage)
    .bail()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("newPasswordConfirm")
    .exists()
    .withMessage("'passwordConfirmation'" + existsMessage)
    .bail()
    .trim()
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage("Password confirmation doesn't match"),
];

module.exports = {
  validateRegister,
  validateMessage,
  validateProfileUpdate,
  validatePasswordUpdate,
};
