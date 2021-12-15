/* eslint-disable no-underscore-dangle */
const commentRouter = require("express").Router();
const Comment = require("../models/comment");
const { userExtractor } = require("../utils/middleware");
const Feedback = require("../models/feedback");

// Get All
commentRouter.get("/", async (request, response) => {
  const comments = await Comment.find({})
    .populate("user", {
      username: 1,
      name: 1,
    })
    .populate("feedback", {
      title: 1,
      description: 1,
    });
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
  feedback.comments = feedback.comments.concat(savedComment._id);
  await feedback.save();
  return response.json(savedComment);
});

// Delete
commentRouter.delete("/:id", userExtractor, async (request, response) => {
  const { user } = request;

  const comment = await Comment.findById(request.params.id);

  if (comment.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only the creator can delete blogs" });
  }

  await comment.remove();
  return response.status(204).end();
});
module.exports = commentRouter;
