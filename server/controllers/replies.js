/* eslint-disable no-underscore-dangle */
const replyRouter = require("express").Router();
const Reply = require("../models/reply");
const Comment = require("../models/comment");
const { userExtractor } = require("../utils/middleware");

// Get All
replyRouter.get("/", async (request, response) => {
  const replies = await Reply.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(replies.map((reply) => reply));
});

// Create
replyRouter.post("/:id", userExtractor, async (request, response) => {
  const { body, user } = request;
  const comment = await Comment.findById(request.params.id);

  const reply = new Reply({
    content: body.content,
    user: user._id,
    comment: comment._id,
  });

  const savedReply = await reply.save();
  user.replies = user.replies.concat(savedReply._id);
  comment.replies = comment.replies.concat(savedReply._id);
  await user.save();
  await comment.save();
  return response.json(savedReply);
});

module.exports = replyRouter;
