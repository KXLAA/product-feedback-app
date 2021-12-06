const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("feedback", {
    title: 1,
    description: 1,
  });
  response.json(users);
});

userRouter.post("/", async (request, response) => {
  const { body } = request;

  if (body.password.length <= 3) {
    return response.status(400).json({ error: "password too short" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();
  return response.json(savedUser);
});

module.exports = userRouter;
