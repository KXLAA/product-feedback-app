/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  name: String,
  passwordHash: String,
  email: String,
  avatar: {
    type: String,
  },
  feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
  ],
  liked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    const object = returnedObject;
    object.id = object._id.toString();
    delete object._id;
    delete object.__v;
    delete object.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
