const { body, validationResult } = require("express-validator");

const AUTHOR_MAX_LENGTH = 50;
const MESSAGE_MAX_LENGTH = 280;

function buildFormData({ errors = [], author = "", message = "" } = {}) {
  return {
    errors,
    values: { author, message },
    limits: {
      authorMaxLength: AUTHOR_MAX_LENGTH,
      messageMaxLength: MESSAGE_MAX_LENGTH,
    },
  };
}

function createIndexController(db = require("../db/queries")) {
  const indexGet = async (req, res, next) => {
    try {
      const messages = await db.getAllMessages();
      res.render("index", { title: "Mini Messageboard", messages });
    } catch (error) {
      next(error);
    }
  };

  const newMessageGet = (req, res) => {
    res.render("form", buildFormData());
  };

  const newMessagePost = [
    body("author")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Author is required.")
      .isLength({ max: AUTHOR_MAX_LENGTH })
      .withMessage(`Author must be at most ${AUTHOR_MAX_LENGTH} characters.`),
    body("message")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Message is required.")
      .isLength({ max: MESSAGE_MAX_LENGTH })
      .withMessage(`Message must be at most ${MESSAGE_MAX_LENGTH} characters.`),
    async (req, res, next) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).render(
            "form",
            buildFormData({
              errors: errors.array(),
              author: typeof req.body.author === "string" ? req.body.author.trim() : "",
              message: typeof req.body.message === "string" ? req.body.message.trim() : "",
            }),
          );
        }

        await db.createMessage({
          user: req.body.author,
          text: req.body.message,
        });

        res.redirect("/");
      } catch (error) {
        next(error);
      }
    },
  ];

  const messageDetailsGet = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(404).send("Message not found");
      }

      const message = await db.getMessageById(id);
      if (!message) {
        return res.status(404).send("Message not found");
      }

      res.render("message", { title: "Message Details", message });
    } catch (error) {
      next(error);
    }
  };

  return {
    indexGet,
    newMessageGet,
    newMessagePost,
    messageDetailsGet,
  };
}

module.exports = createIndexController;
