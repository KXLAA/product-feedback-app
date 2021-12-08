/* eslint-disable no-underscore-dangle */
const commentRouter = require("express").Router();
const Comment = require("../models/comment");
const { userExtractor } = require("../utils/middleware");
const Feedback = require("../models/feedback");

// Get All
commentRouter.get("/", async (request, response) => {
  const comments = await Comment.find({});
  response.json(comments.map((comment) => comment));
});

// Create
commentRouter.post("/:id", userExtractor, async (request, response) => {
  const { body, user } = request;
  const feedback = await Feedback.findById(request.params.id);

  const comment = new Comment({
    content: body.content,
    user: user._id,
    feedback: feedback._id,
  });

  const savedComment = await comment.save();
  user.comments = user.comments.concat(savedComment._id);
  feedback.comments = feedback.comments.concat(savedComment._id);
  await user.save();
  await feedback.save();
  return response.json(savedComment);
});
module.exports = commentRouter;
