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
      .get("/api/feedback-list?category&sort=mostUpvotes")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("All feedback in feedback list returns", async () => {
    const response = await api.get(
      "/api/feedback-list?category&sort=mostUpvotes"
    );
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

  test("creation fails with proper status code & message if password is too short", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "kola",
      name: "kola",
      password: "22",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();

    expect(result.body.error).toContain("password too short");
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  }, 1000);
});

let headers;

describe("Feedback can be CREATED", () => {
  beforeEach(async () => {
    const newUser = {
      username: "testing",
      name: "testing",
      password: "testing",
    };
    await api.post("/api/users").send(newUser);

    const result = await api.post("/api/login").send(newUser);

    headers = {
      Authorization: `bearer ${result.body.token}`,
    };
  });

  test("user can create feedback", async () => {
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
      .set(headers)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const feedbackAtEnd = await helper.feedbackInDb();
    expect(feedbackAtEnd).toHaveLength(feedbackAtStart.length + 1);
  }, 10000);

  test("upvotes get value 0 as default", async () => {
    const newFeedback = {
      title: "Testing Feedback Tests 45566",
      category: "Test",
      status: "ongoing",
      description: "This is a test for a test, with a test with jest",
      comments: [],
    };

    await api
      .post("/api/feedback-list")
      .send(newFeedback)
      .set(headers)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const feedbackAtEnd = await helper.feedbackInDb();
    const added = feedbackAtEnd.find(
      (feedback) => feedback.title === newFeedback.title
    );
    expect(added.upvotes).toEqual(0);
  }, 10000);

  test("operation fails with proper error if token is missing", async () => {
    const newFeedback = {
      title: "Testing Feedback Tests",
      category: "Test",
      upvotes: 300,
      status: "ongoing",
      description: "This is a test for a test, with a test with jest",
      comments: [],
    };

    await api
      .post("/api/feedback-list")
      .send(newFeedback)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });
});

describe("Feedback can be DELETED", () => {
  let result;
  beforeEach(async () => {
    const usersAtStart = await helper.usersInDb();
    const userToCreate = usersAtStart[0];

    const newFeedback = {
      title: "Testing Delete Tests",
      category: "Test",
      upvotes: 300,
      status: "ongoing",
      description: "This is a test for a test, with a test with jest 4 kxla",
      comments: [],
      userId: `${userToCreate.id}`,
    };

    result = await api
      .post("/api/feedback-list")
      .send(newFeedback)
      .set(headers);
  });

  test("Feedback can be DELETED ", async () => {
    const FeedbackToDel = result.body;

    const initialFeedback = await helper.feedbackInDb();
    await api
      .delete(`/api/feedback-list/${FeedbackToDel.id}`)
      .set(headers)
      .expect(204);

    const FeedbackAtEnd = await helper.feedbackInDb();

    expect(FeedbackAtEnd.length).toBe(initialFeedback.length - 1);

    const titles = FeedbackAtEnd.map((feedback) => feedback.title);
    expect(titles).not.toContain(FeedbackToDel.title);
  }, 10000);
});

describe("Feedback can be UPDATED", () => {
  let result;
  beforeEach(async () => {
    const usersAtStart = await helper.usersInDb();
    const userToCreate = usersAtStart[0];

    const newFeedback = {
      title: "Testing Delete Tests",
      category: "Test",
      upvotes: 300,
      status: "ongoing",
      description: "This is a test for a test, with a test with jest 4 kxla",
      comments: [],
      userId: `${userToCreate.id}`,
    };

    result = await api
      .post("/api/feedback-list")
      .send(newFeedback)
      .set(headers);
  });

  test("Feedback can be UPDATED ", async () => {
    const FeedbackToUpdate = result.body;

    const editedFeedback = {
      ...FeedbackToUpdate,
      upvotes: FeedbackToUpdate.upvotes + 1,
    };

    await api
      .put(`/api/feedback-list/${FeedbackToUpdate.id}`)
      .send(editedFeedback)
      .expect(200)
      .set(headers);

    const FeedbackAtEnd = await helper.feedbackInDb();
    const edited = FeedbackAtEnd.find(
      (feedback) => feedback.description === FeedbackToUpdate.description
    );
    expect(edited.upvotes).toBe(FeedbackToUpdate.upvotes + 1);
  }, 10000);
});

afterAll(() => {
  mongoose.connection.close();
});
