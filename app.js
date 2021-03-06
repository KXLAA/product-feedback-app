const express = require("express");
require("express-async-errors");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
const feedbackRouter = require("./controllers/feedbackList");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const commentRouter = require("./controllers/comment");
const replyRouter = require("./controllers/replies");

const app = express();

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// Routes
app.use("/api/feedback-list", feedbackRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/comments", commentRouter);
app.use("/api/replies", replyRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
