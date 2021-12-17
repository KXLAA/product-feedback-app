/* eslint-disable no-underscore-dangle */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { body } = request;

  const user = await User.findOne({ username: body.username });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // Generate jwt Token
  const token = jwt.sign(userForToken, process.env.SECRET, {
    // token expires in 60*60 seconds, that is, in one hour
    expiresIn: 60 * 60,
  });

  // Send response with Token
  return response.status(200).send({
    token,
    username: user.username,
    name: user.name,
    id: user._id,
    avatar: user.avatar,
    feedback: user.feedback,
    liked: user.liked,
  });
});

module.exports = loginRouter;
