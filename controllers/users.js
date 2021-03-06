const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

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

// Update
userRouter.put("/:id", async (request, response) => {
  const { body } = request;
  const user = await User.findById(request.params.id);

  let updatedUser;
  const options = {
    new: true,
  };

  if (user.liked.some((like) => like.toString() === body.liked))
    updatedUser = await User.findByIdAndUpdate(
      { _id: request.params.id },
      { $pull: { liked: body.liked } },
      options
    );

  if (!user.liked.some((like) => like.toString() === body.liked))
    updatedUser = await User.findByIdAndUpdate(
      { _id: request.params.id },
      { $push: { liked: body.liked } },
      options
    );

  return response.json(updatedUser);
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
    avatar: body.avatar,
    passwordHash,
  });

  const savedUser = await user.save();
  return response.json(savedUser);
});

module.exports = userRouter;
