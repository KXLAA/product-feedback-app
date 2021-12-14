const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

const randomNumber = Math.floor(Math.random() * 1000 + 1);

userRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

userRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id);
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
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
    email: body.email,
    name: body.name,
    avatar: `https://avatars.dicebear.com/api/human/${randomNumber}.svg`,
    passwordHash,
  });

  const savedUser = await user.save();
  return response.json(savedUser);
});

module.exports = userRouter;