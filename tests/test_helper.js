/* eslint-disable no-underscore-dangle */
const Feedback = require("../models/feedback");
const User = require("../models/user");

const initialFeedbackList = [
  {
    title: "Add tags for solutions",
    category: "enhancement",
    upvotes: 112,
    status: "suggestion",
    description: "Easier to search for solutions based on a specific stack.",
    comments: [],
  },
  {
    title: "Q&A within the challenge hubs",
    category: "feature",
    upvotes: 65,
    status: "suggestion",
    description: "Challenge-specific Q&A would make for easy reference.",
    comments: [],
  },
];

const feedbackInDb = async () => {
  const feedbackList = await Feedback.find({});
  return feedbackList.map((feedback) => feedback.toJSON());
};

const nonExistingId = async () => {
  const feedback = new Feedback({
    title: "will remove this soon",
    category: "feature",
    upvotes: 65,
    status: "suggestion",
    description: "will remove thi soon.",
    comments: [],
  });
  await feedback.save();
  await feedback.remove();

  return feedback._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialFeedbackList,
  feedbackInDb,
  nonExistingId,
  usersInDb,
};
