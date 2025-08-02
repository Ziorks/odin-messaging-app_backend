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

    const user = await db.getUserWithProfileById(req.user.id);
    let picturePublicId = "messaging_app_profile_pics/icsll72wpxwcku6gb1by";

    //if picture was sent => upload to cloudinary
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const b64 = Buffer.from(buffer).toString("base64");
      const dataURI = "data:" + mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "messaging_app_profile_pics",
      });
      req.body.picture = result.secure_url;
      picturePublicId = result.public_id;
    }

    try {
      const { picture: pictureURL, about, username } = req.body;
      await db.updateUserAndProfile(req.user.id, {
        pictureURL,
        picturePublicId,
        about,
        username,
      });
    } catch (err) {
      //delete new pic if something goes wrong
      try {
        await cloudinary.uploader.destroy(picturePublicId);
      } catch (err) {
        return next(err);
      }
      return next(err);
    }

    //delete old picture from cloudinary
    const oldPicPublicId = user.profile.picturePublicId;
    if (oldPicPublicId !== "messaging_app_profile_pics/icsll72wpxwcku6gb1by") {
      await cloudinary.uploader.destroy(oldPicPublicId);
    }

    return res.json({ message: "profile updated" });
  },
];

const currentUserPasswordUpdate = [
  validatePasswordUpdate,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { newPassword } = req.body;
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
