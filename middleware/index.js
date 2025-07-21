const db = require("../db/queries");

const notFoundHandler = (req, res) => {
  return res.sendStatus(404);
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  return res
    .status(500)
    .json({ error: err, message: "An error occured on the server" });
};

const isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "You need to be logged in to perform this action" });
  }

  const profile = await db.getProfileByUserId(req.user.id);
  await db.updateProfile(profile.id, { lastActive: new Date() });
  return next();
};

module.exports = {
  notFoundHandler,
  errorHandler,
  isLoggedIn,
};
