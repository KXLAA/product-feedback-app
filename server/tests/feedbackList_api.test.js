/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

const api = supertest(app);
const Feedback = require("../models/feedback");
const User = require("../models/user");
const helper = require("./test_helper");

describe("when there is a list of feedback", () => {
  beforeEach(async () => {
    await Feedback.deleteMany({});
    await Feedback.insertMany(helper.initialFeedbackList);
  });

  test("Feedback is returned as json", async () => {
    await api
      .get("/api/feedback-list")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("All feedback in feedback list returns", async () => {
    const response = await api.get("/api/feedback-list");
    expect(response.body).toHaveLength(helper.initialFeedbackList.length);
  });
});

describe("viewing specific feedback", () => {
  test("succeeds with valid ID", async () => {
    const feedbackAtStart = await helper.feedbackInDb();

    const feedbackToView = feedbackAtStart[0];
    const result = await api
      .get(`/api/feedback-list/${feedbackToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedFeedbackToView = JSON.parse(JSON.stringify(feedbackToView));
    expect(result.body).toEqual(processedFeedbackToView);
  });

  test("fails with 404 if Feedback does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    await api.get(`/api/feedback-list/${validNonexistingId}`).expect(404);
  });

  test("fails with 400 if id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";
    await api.get(`/api/feedback-list/${invalidId}`).expect(400);
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("kxla", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("user can be created", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "UseeTest2",
      name: "Test2",
      password: "Test2",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  }, 10000);

  test("creation fails with proper status code & message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "kxla",
      password: "kxla",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(500)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(result.body.error).toContain("Username already exists!");
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  }, 1000);

  test("creation fails with proper status code & message if password is too short", async () => {});
});

describe("Feedback can be CREATED", () => {
  test("user can Create feedback", async () => {
    const feedbackAtStart = await helper.feedbackInDb();
    const usersAtStart = await helper.usersInDb();
    const userToCreate = usersAtStart[0];

    const newFeedback = {
      title: "Testing Feedback Tests",
      category: "Test",
      upvotes: 300,
      status: "ongoing",
      description: "This is a test for a test, with a test with jest",
      comments: [],
      userId: `${userToCreate.id}`,
    };

    await api
      .post("/api/feedback-list")
      .send(newFeedback)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const feedbackAtEnd = await helper.feedbackInDb();
    expect(feedbackAtEnd).toHaveLength(feedbackAtStart.length + 1);
  }, 10000);
});

describe("Feedback can be UPDATED ", () => {});

describe("Feedback can be DELETED ", () => {});

afterAll(() => {
  mongoose.connection.close();
});
