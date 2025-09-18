require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("./utilities/session");
const passport = require("./utilities/passport");
const { notFoundHandler, errorHandler } = require("./middleware");
const indexRouter = require("./routes/indexRouter");
const messageRouter = require("./routes/messageRouter");
const threadRouter = require("./routes/threadRouter");
const userRouter = require("./routes/userRouter");

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use(session);
app.use(passport);

app.use("/", indexRouter);
app.use("/message", messageRouter);
app.use("/thread", threadRouter);
app.use("/user", userRouter);
app.use("*splat", notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
