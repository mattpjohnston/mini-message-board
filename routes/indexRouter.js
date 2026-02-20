const { Router } = require("express");

const indexRouter = Router();

const messages = [
  {
    text: "Hi there!",
    user: "Amando",
    added: new Date(),
  },
  {
    text: "Hello World!",
    user: "Charles",
    added: new Date(),
  },
];

indexRouter.get("/", (req, res) => {
  res.render("index", { title: "Mini Messageboard", messages: messages });
});

indexRouter.get("/new", (req, res) => {
  res.render("form");
});

indexRouter.post("/new", (req, res) => {
  messages.push({
    text: req.body.message,
    user: req.body.author,
    added: new Date(),
  });

  res.redirect("/");
});

indexRouter.get("/messages/:id", (req, res) => {
  const id = req.params.id;
  const message = messages[id];

  if (Number.isNaN(id) || !message) {
    return res.status(404).send("Message not found");
  }

  res.render("message", { title: "Message Details", message: message });
});

module.exports = indexRouter;
