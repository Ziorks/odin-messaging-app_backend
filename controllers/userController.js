const cloudinary = require("../utilities/cloudinary");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const {
  validateProfileUpdate,
  validatePasswordUpdate,
} = require("../utilities/validators");
const db = require("../db/queries");

const userSearchGet = async (req, res) => {
  let { search, page, resultsPerPage } = req.query;
  if (page) {
    page = +page;
  }
  if (resultsPerPage) {
    resultsPerPage = +resultsPerPage;
  }
  const results = await db.getAllUsers({
    search,
    page,
    resultsPerPage,
  });

  return res.json({ results });
};

const currentUserGet = async (req, res) => {
  const user = await db.getUserWithProfileById(req.user.id);

  return res.json({ user });
};

const currentUserProfileUpdate = [
  validateProfileUpdate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { username } = req.body;
    const newUsernameUser = await db.getUserByUsername(username);
    if (newUsernameUser && newUsernameUser.id !== req.user.id) {
      return res.status(400).json({
        message: "validation failed",
        errors: [{ msg: "Username is taken" }],
      });
    }

    const user = await db.getUserWithProfileById(req.user.id);

    //if picture was sent => upload to cloudinary
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const b64 = Buffer.from(buffer).toString("base64");
      const dataURI = "data:" + mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "messaging_app_profile_pics",
      });
      req.body.pictureURL = result.secure_url;
      req.body.picturePublicId = result.public_id;
    }

    const { pictureURL, picturePublicId, about } = req.body;
    try {
      await db.updateUserAndProfile(req.user.id, {
        pictureURL,
        picturePublicId,
        about,
        username,
      });
    } catch (err) {
      //delete new pic if something goes wrong
      if (picturePublicId) {
        try {
          await cloudinary.uploader.destroy(picturePublicId);
        } catch (err) {
          return next(err);
        }
      }
      return next(err);
    }

    //delete old picture from cloudinary
    const oldPicPublicId = user.profile.picturePublicId;
    if (
      req.file &&
      oldPicPublicId !== "messaging_app_profile_pics/icsll72wpxwcku6gb1by"
    ) {
      await cloudinary.uploader.destroy(oldPicPublicId);
    }

    return res.json({ message: "profile updated" });
  },
];

const currentUserPasswordUpdate = [
  validatePasswordUpdate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "validation failed",
        errors: errors.array(),
      });
    }

    const { newPassword, oldPassword } = req.body;

    const user = await db.getUserById(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({
        message: "validation failed",
        errors: [{ msg: "'oldPassword' is incorrect" }],
      });
    }

    bcrypt.hash(newPassword, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      try {
        await db.updateUserAndProfile(req.user.id, {
          password: hashedPassword,
        });
        return res.json({ message: "password updated" });
      } catch (err) {
        return next(err);
      }
    });
  },
];

const userGet = async (req, res) => {
  const { userId } = req.params;
  const user = await db.getUserWithProfileById(+userId);

  return res.json({ user });
};

module.exports = {
  userSearchGet,
  currentUserGet,
  currentUserProfileUpdate,
  currentUserPasswordUpdate,
  userGet,
};
