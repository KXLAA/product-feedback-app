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
    avatar: 1,
  });
  response.json(replies.map((reply) => reply));
});

replyRouter.get("/:id", async (request, response) => {
  const replies = await Reply.findById(request.params.id).populate("user", {
    username: 1,
    name: 1,
    avatar: 1,
  });
  if (replies) {
    response.json(replies);
  } else {
    response.status(404).end();
  }
});

// Delete
replyRouter.delete("/:id", userExtractor, async (request, response) => {
  const { user } = request;
  const reply = await Reply.findById(request.params.id);
  const comment = await Comment.findById(reply.comment);

  if (reply.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only the creator can delete blogs" });
  }
  await reply.remove();
  comment.replies = comment.replies.filter(
    (replyToDel) => replyToDel.toString() !== request.params.id.toString()
  );

  await comment.save();
  return response.status(204).end();
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
  // user.replies = user.replies.concat(savedReply._id);
  comment.replies = comment.replies.concat(savedReply._id);
  // await user.save();
  await comment.save();
  return response.json(savedReply);
});

module.exports = replyRouter;
