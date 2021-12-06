/* eslint-disable no-underscore-dangle */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { body } = request;

  // Find user
  const user = await User.findOne({ username: body.username });

  // Check if user exists & password is correct
  const passwordCorrect =
    user === null ? false : bcrypt.compare(body.password, user.passwordHash);

  // Return Valid status code
  if (!(passwordCorrect && user)) {
    return response.status(404).json({
      error: "invalid username or password",
    });
  }

  // Prep user for jwt Token
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
  return response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
