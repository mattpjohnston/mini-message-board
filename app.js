const path = require("node:path");
const express = require("express");
const createIndexRouter = require("./routes/indexRouter");

function createApp(db) {
  const app = express();

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  const assetsPath = path.join(__dirname, "public");
  app.use(express.static(assetsPath));

  app.use(express.urlencoded({ extended: true }));
  app.use("/", createIndexRouter(db));

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Internal server error");
  });

  return app;
}

function startServer() {
  const app = createApp();
  const PORT = process.env.PORT || 3000;

  return app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }
    console.log(`listening on port ${PORT}!`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer,
};
