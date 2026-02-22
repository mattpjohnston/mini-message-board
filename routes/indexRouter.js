const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", indexController.indexGet);
indexRouter.get("/new", indexController.newMessageGet);
indexRouter.post("/new", indexController.newMessagePost);
indexRouter.get("/messages/:id", indexController.messageDetailsGet);

module.exports = indexRouter;
