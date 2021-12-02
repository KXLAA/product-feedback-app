const mongoose = require("mongoose");
const logger = require("../utils/logger");

if (process.argv.length < 3) {
  logger.info(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://kxla:${password}@cluster0.ptivn.mongodb.net/product-feedback-app?retryWrites=true&w=majority`;

mongoose.connect(url);

const feedbackSchema = new mongoose.Schema({
  title: String,
  category: String,
  upvotes: Number,
  status: String,
  description: String,
  comments: [String],
});

const Feedback = mongoose.model("feedback", feedbackSchema);

const title = process.argv[3];
const category = process.argv[4];
const upvotes = process.argv[5];
const status = process.argv[6];
const description = process.argv[7];
const comments = process.argv[8];

const feedback = new Feedback({
  title: `${title}`,
  category: `${category}`,
  upvotes: `${upvotes}`,
  status: `${status}`,
  description: `${description}`,
  comments: `${comments}`,
});

feedback.save().then(() => {
  logger.info(`added ${title} to database`);
  mongoose.connection.close();
});

if (password) {
  Feedback.find({}).then((result) => {
    result.forEach(() => {
      logger.info(`${title}`);
    });
    mongoose.connection.close();
  });
}
