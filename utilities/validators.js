const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); //2MB limit
const { body } = require("express-validator");

const existsMessage = " is required";

const validateRegister = [
  body("username")
    .exists()
    .withMessage("'username'" + existsMessage)
    .trim()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long"),
  body("password")
    .exists()
    .withMessage("'password'" + existsMessage)
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirmation")
    .exists()
    .withMessage("'passwordConfirmation'" + existsMessage)
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation doesn't match"),
];

const validateMessageUpdate = [
  body("body")
    .exists()
    .withMessage("'body'" + existsMessage)
    .trim()
    .isString()
    .withMessage("'body' must be a string")
    .notEmpty()
    .withMessage("'body' can't be an empty string"),
];

const validateMessageCreate = [
  ...validateMessageUpdate,
  body("threadId")
    .exists()
    .withMessage("'threadId'" + existsMessage)
    .isInt()
    .withMessage("'threadId' must be an integer")
    .toInt(),
];

const validateProfileUpdate = [
  (req, res, next) => {
    upload.single("picture")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.fileValidationError = {
            message: "File too large. Max 2MB allowed.",
          };
        } else {
          return next(err);
        }
      }

      return next();
    });
  },
  body("picture").custom((_, { req }) => {
    if (req.fileValidationError) {
      throw new Error(req.fileValidationError.message);
    }

    const picture = req.file;
    if (!picture) return true;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(picture.mimetype)) {
      throw new Error("Only image files are allowed");
    }
    return true;
  }),
  body("about").trim().isString().withMessage("'about' must be a string"),
  body("username")
    .exists()
    .withMessage("'username'" + existsMessage)
    .trim()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long"),
];

const validatePasswordUpdate = [
  body("oldPassword")
    .exists()
    .withMessage("'oldPassword'" + existsMessage)
    .trim(),
  body("newPassword")
    .exists()
    .withMessage("'newPassword'" + existsMessage)
    .trim()
    .bail()
    .isLength({ min: 6 })
    .withMessage("'newPassword' must be at least 6 characters long"),
  body("newPasswordConfirm")
    .exists()
    .withMessage("'passwordConfirmation'" + existsMessage)
    .trim()
    .bail()
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage("'passwordConfirmation' doesn't match 'newPassword'"),
];

const validateThreadFindOrCreate = [
  body("recipientIds")
    .isArray()
    .withMessage("'recipientIds' must be an array of userIds"),
  body("recipientIds.*")
    .isInt()
    .withMessage("Each element of 'recipientIds' must be an integer")
    .toInt(),
];

module.exports = {
  validateRegister,
  validateMessageUpdate,
  validateMessageCreate,
  validateProfileUpdate,
  validatePasswordUpdate,
  validateThreadFindOrCreate,
};
