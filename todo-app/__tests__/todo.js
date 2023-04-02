/* eslint-disable no-undef */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent
      .put(`/todos/${todoID}/markASCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
    const todo = await agent.post("/todos").send({
      title: "Test todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(todo.text);
    const todoID = parsedResponse.id;

    const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    const parsedDeletedResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeletedResponse).toBe(true);

    const deleteNonExistentTodoResponse = await agent
      .delete(`/todos/9999`)
      .send();
    const parsedDeleteNonExistentTodoResponse = JSON.parse(
      deleteNonExistentTodoResponse.text
    );
    expect(parsedDeleteNonExistentTodoResponse).toBe(false);
  }, 10000);
  //     const response = await agent.post("/todos").send({
  //         title: "todo Test",
  //         dueDate: new Date().toISOString(),
  //         completed: false,
  //     });
  //     const parsedResponse = JSON.parse(response.text);
  //     const todoID = parsedResponse.id;

  //     const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
  //     expect(deleteResponse.statusCode).toBe(200);
  //     expect(deleteResponse.text).toBe("true");

  //     const getResponse = await agent.get(`/todos/${todoID}`).send();
  //     expect(getResponse.statusCode).toBe(404);
  // });
});