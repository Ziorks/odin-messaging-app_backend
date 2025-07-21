require("dotenv").config();
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("../generated/prisma");

module.exports = session({
  store: new PrismaSessionStore(new PrismaClient(), {
    checkPeriod: 1000 * 60 * 2,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, //one week
  },
});
