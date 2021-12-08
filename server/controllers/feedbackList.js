/* eslint-disable no-underscore-dangle */
const feedbackRouter = require("express").Router();
const Feedback = require("../models/feedback");
const { userExtractor } = require("../utils/middleware");

// Get All
feedbackRouter.get("/", async (request, response) => {
  const feedbackList = await Feedback.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(feedbackList.map((feedback) => feedback));
});

feedbackRouter.get("/:id", async (request, response) => {
  const feedback = await Feedback.findById(request.params.id);
  if (feedback) {
    response.json(feedback);
  } else {
    response.status(404).end();
  }
});

// Create
feedbackRouter.post("/", userExtractor, async (request, response) => {
  const { body, user } = request;

  const feedback = new Feedback({
    title: body.title,
    category: body.category,
    upvotes: body.upvotes,
    status: body.status,
    description: body.description,
    comments: [],
    user: user._id,
  });

  if (!feedback.upvotes) {
    feedback.upvotes = 0;
  }

  const savedFeedback = await feedback.save();
  user.feedback = user.feedback.concat(savedFeedback._id);
  await user.save();
  return response.json(savedFeedback);
});

// Update
feedbackRouter.put("/:id", userExtractor, async (request, response) => {
  const { body, user } = request;

  const feedback = await Feedback.findById(request.params.id);
  if (feedback.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only the creator can update feedback" });
  }
  const newFeedback = {
    title: body.title,
    upvotes: body.upvotes,
    category: body.category,
    status: body.status,
    description: body.description,
  };

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    request.params.id,
    newFeedback,
    {
      new: true,
    }
  );

  return response.json(updatedFeedback);
});

// Delete
feedbackRouter.delete("/:id", userExtractor, async (request, response) => {
  const { user } = request;

  const feedback = await Feedback.findById(request.params.id);
  if (feedback.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only the creator can delete blogs" });
  }

  await feedback.remove();
  user.feedback = user.feedback.filter(
    (feedbackToDelete) =>
      feedbackToDelete.id.toString() !== request.params.id.toString()
  );
  await user.save();
  return response.status(204).end();
});

module.exports = feedbackRouter;
