/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: String,
    upvotes: Number,
    status: String,
    description: { type: String, required: true },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

feedbackSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    const object = returnedObject;
    object.id = object._id.toString();
    delete object._id;
    delete object.__v;
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
