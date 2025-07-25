const db = require("../db/queries");

const currentUserGet = async (req, res) => {
  const profile = await db.getProfileByUserId(req.user.id);

  return res.json({ profile });
};

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

const userGet = async (req, res) => {
  const { userId } = req.params;
  const profile = await db.getProfileByUserId(+userId);

  return res.json({ profile });
};

module.exports = { currentUserGet, userSearchGet, userGet };
