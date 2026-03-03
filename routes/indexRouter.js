const { Router } = require("express");
const createIndexController = require("../controllers/indexController");

function createIndexRouter(db) {
  const indexRouter = Router();
  const indexController = createIndexController(db);

  indexRouter.get("/", indexController.indexGet);
  indexRouter.get("/new", indexController.newMessageGet);
  indexRouter.post("/new", indexController.newMessagePost);
  indexRouter.get("/messages/:id", indexController.messageDetailsGet);

  return indexRouter;
}

module.exports = createIndexRouter;
