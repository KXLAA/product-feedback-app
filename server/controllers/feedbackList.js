/* eslint-disable no-underscore-dangle */
const feedbackRouter = require("express").Router();
const Feedback = require("../models/feedback");
const User = require("../models/user");

feedbackRouter.get("/", async (request, response) => {
  const feedbacks = await Feedback.find({});
  response.json(feedbacks.map((feedback) => feedback));
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
feedbackRouter.post("/", async (request, response) => {
  const { body } = request;
  const user = await User.findById(body.userId);

  const feedback = new Feedback({
    title: body.title,
    category: body.category,
    upvotes: body.upvotes,
    status: body.status,
    description: body.description,
    comments: [],
    user: user._id,
  });

  const savedFeedback = await feedback.save();
  user.feedback = user.feedback.concat(savedFeedback._id);
  await user.save();
  response.json(savedFeedback);
});

// Update
feedbackRouter.put("/:id", async (request, response) => {
  const { body } = request;

  const feedback = {
    title: body.title,
    category: body.category,
    status: body.status,
    description: body.description,
  };

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    request.params.id,
    feedback,
    {
      new: true,
    }
  );

  response.json(updatedFeedback);
});

// Delete
feedbackRouter.delete("/:id", async (request, response) => {
  await Feedback.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = feedbackRouter;
