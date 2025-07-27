const db = require("../db/queries");

const currentUserGet = async (req, res) => {
  const user = await db.getUserWithProfileById(req.user.id);

  return res.json({ user });
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
  const user = await db.getUserWithProfileById(+userId);

  return res.json({ user });
};

module.exports = { currentUserGet, userSearchGet, userGet };
