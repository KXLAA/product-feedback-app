/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  upvotes: Number,
  status: String,
  description: { type: String, required: true },
  comments: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

feedbackSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    const object = returnedObject;
    object.id = object._id.toString();
    delete object._id;
    delete object.__v;
  },
});

module.exports = mongoose.model("feedback", feedbackSchema);
