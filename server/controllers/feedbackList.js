/* eslint-disable no-underscore-dangle */
const feedbackRouter = require("express").Router();
const Feedback = require("../models/feedback");
const { userExtractor } = require("../utils/middleware");

// Get All
feedbackRouter.get("/", async (request, response) => {
  let responses;
  if (!request.query.category) {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "all") {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "ui") {
    responses = await Feedback.find({ category: "ui" })
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "ux") {
    responses = await Feedback.find({ category: "ux" })
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "enhancement") {
    responses = await Feedback.find({ category: "enhancement" })
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "bug") {
    responses = await Feedback.find({ category: "bug" })
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.category === "feature") {
    responses = await Feedback.find({ category: "feature" })
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      });
  }
  if (request.query.sort === "mostUpvotes") {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      })
      .sort({ upvotes: -1 });
  }
  if (request.query.sort === "leastUpvotes") {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      })
      .sort({ upvotes: 1 });
  }
  if (request.query.sort === "mostComments") {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      })
      .sort({ comments: -1 });
  }
  if (request.query.sort === "leastComments") {
    responses = await Feedback.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {
        content: 1,
        user: 1,
      })
      .sort({ comments: 1 });
  }
  response.json(responses.map((res) => res));
});

feedbackRouter.get("/:id", async (request, response) => {
  const feedback = await Feedback.findById(request.params.id).populate(
    "comments"
  );
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

  if (!feedback.status) {
    feedback.status = "Suggestion";
  }

  const savedFeedback = await feedback.save();
  user.feedback = user.feedback.concat(savedFeedback._id);
  await user.save();
  return response.json(savedFeedback);
});

// Update
feedbackRouter.put("/:id", userExtractor, async (request, response) => {
  const { body } = request;

  const newFeedback = {
    title: body.title,
    upvotes: body.upvotes,
    category: body.category,
    status: body.status,
    description: body.description,
  };

  const options = {
    new: true,
  };

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    { _id: request.params.id },
    newFeedback,
    options
  ).exec();

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
