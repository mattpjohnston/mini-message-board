const assert = require("node:assert/strict");
const test = require("node:test");
const createIndexController = require("../controllers/indexController");

function createFakeDb(overrides = {}) {
  return {
    async getAllMessages() {
      return [];
    },
    async createMessage() {},
    async getMessageById() {
      return null;
    },
    ...overrides,
  };
}

function createResponse() {
  return {
    statusCode: 200,
    viewName: null,
    viewData: null,
    redirectUrl: null,
    body: null,
    finished: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    render(viewName, viewData) {
      this.viewName = viewName;
      this.viewData = viewData;
      this.finished = true;
      return this;
    },
    redirect(url) {
      this.statusCode = 302;
      this.redirectUrl = url;
      this.finished = true;
      return this;
    },
    send(body) {
      this.body = body;
      this.finished = true;
      return this;
    },
  };
}

function createNextRecorder() {
  const calls = [];

  function next(error) {
    if (error !== undefined) {
      calls.push(error);
    }
  }

  return { next, calls };
}

function runMiddleware(middleware, req, res, next) {
  return new Promise((resolve, reject) => {
    let settled = false;

    function finish(error) {
      if (settled) {
        return;
      }

      settled = true;

      if (error) {
        reject(error);
        return;
      }

      resolve();
    }

    function wrappedNext(error) {
      try {
        next(error);
        finish();
      } catch (nextError) {
        reject(nextError);
      }
    }

    try {
      const result = middleware(req, res, wrappedNext);

      if (result && typeof result.then === "function") {
        result.then(() => finish(), reject);
        return;
      }

      queueMicrotask(() => {
        if (!settled) {
          finish();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function runMiddlewareStack(middlewares, req, res, next) {
  for (const middleware of middlewares) {
    await runMiddleware(middleware, req, res, next);

    if (res.finished) {
      break;
    }
  }
}

test("indexGet renders the home page with messages", async () => {
  const messages = [
    {
      id: 1,
      user: "Amando",
      text: "Hi there!",
      added: new Date("2026-03-01T10:00:00Z"),
    },
  ];

  const controller = createIndexController(
    createFakeDb({
      async getAllMessages() {
        return messages;
      },
    }),
  );
  const res = createResponse();
  const nextRecorder = createNextRecorder();

  await controller.indexGet({}, res, nextRecorder.next);

  assert.equal(res.viewName, "index");
  assert.equal(res.viewData.title, "Mini Messageboard");
  assert.deepEqual(res.viewData.messages, messages);
  assert.deepEqual(nextRecorder.calls, []);
});

test("newMessageGet renders the empty form", () => {
  const controller = createIndexController(createFakeDb());
  const res = createResponse();

  controller.newMessageGet({}, res);

  assert.equal(res.viewName, "form");
  assert.deepEqual(res.viewData.errors, []);
  assert.deepEqual(res.viewData.values, {
    author: "",
    message: "",
  });
  assert.equal(res.viewData.limits.authorMaxLength, 50);
  assert.equal(res.viewData.limits.messageMaxLength, 280);
});

test("newMessagePost returns validation errors for empty fields", async () => {
  let createMessageWasCalled = false;
  const controller = createIndexController(
    createFakeDb({
      async createMessage() {
        createMessageWasCalled = true;
      },
    }),
  );
  const req = {
    body: {
      author: "   ",
      message: "   ",
    },
  };
  const res = createResponse();
  const nextRecorder = createNextRecorder();

  await runMiddlewareStack(controller.newMessagePost, req, res, nextRecorder.next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.viewName, "form");
  assert.equal(createMessageWasCalled, false);
  assert.deepEqual(nextRecorder.calls, []);
  assert.deepEqual(
    res.viewData.errors.map((error) => error.msg),
    ["Author is required.", "Message is required."],
  );
  assert.deepEqual(res.viewData.values, {
    author: "",
    message: "",
  });
});

test("newMessagePost saves valid data and redirects home", async () => {
  let savedMessage;
  const controller = createIndexController(
    createFakeDb({
      async createMessage(message) {
        savedMessage = message;
      },
    }),
  );
  const req = {
    body: {
      author: "  Alice  ",
      message: "  Testing the happy path  ",
    },
  };
  const res = createResponse();
  const nextRecorder = createNextRecorder();

  await runMiddlewareStack(controller.newMessagePost, req, res, nextRecorder.next);

  assert.equal(res.statusCode, 302);
  assert.equal(res.redirectUrl, "/");
  assert.deepEqual(savedMessage, {
    user: "Alice",
    text: "Testing the happy path",
  });
  assert.deepEqual(nextRecorder.calls, []);
});

test("messageDetailsGet renders the message details page", async () => {
  const message = {
    id: 2,
    user: "Charles",
    text: "Hello from the details page",
    added: new Date("2026-03-02T09:00:00Z"),
  };

  const controller = createIndexController(
    createFakeDb({
      async getMessageById(id) {
        if (id === 2) {
          return message;
        }

        return null;
      },
    }),
  );
  const req = {
    params: {
      id: "2",
    },
  };
  const res = createResponse();
  const nextRecorder = createNextRecorder();

  await controller.messageDetailsGet(req, res, nextRecorder.next);

  assert.equal(res.viewName, "message");
  assert.equal(res.viewData.title, "Message Details");
  assert.equal(res.viewData.message, message);
  assert.deepEqual(nextRecorder.calls, []);
});

test("messageDetailsGet returns 404 when the message is missing", async () => {
  const controller = createIndexController(createFakeDb());
  const req = {
    params: {
      id: "999",
    },
  };
  const res = createResponse();
  const nextRecorder = createNextRecorder();

  await controller.messageDetailsGet(req, res, nextRecorder.next);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body, "Message not found");
  assert.deepEqual(nextRecorder.calls, []);
});
