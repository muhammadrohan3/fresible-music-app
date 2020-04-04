const express = require("express");
const server = express();
// const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
require("dotenv").config();
const PORT = process.env.PORT || 7777;
const siteFns = require("./controller/siteFns");
const passport = require("./config/passport-setup");
const routeIndex = require("./routes/index");

//This async functions fetches the list of packages from the db on server initialization to be in sync with the latest.
(async () => {
  const baseLocation = __dirname + "/public/serverData";
  fs.readdir(__dirname + "/public/serverData", (err, files) => {
    if (err) throw new Error(err);
    const data = files.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.split(".")[0].trim()]: fs.readFileSync(
          `${baseLocation}/${curr}`,
          { encoding: "utf-8" }
        )
      }),
      {}
    );
    server.locals = { ...data, ...siteFns() };
  });
})();

server.use("/favicon.ico", (req, res, next) => res.status(204).send());
server.use(express.urlencoded({ extended: false, limit: "50mb" }));
server.use(express.json({ strict: false }));
server.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["iamtryingtoseehowthisisgoingtoworkout"]
  })
);

server.use(passport.initialize());
server.use(passport.session());

server.use(cookieParser());

server.set("view engine", "ejs");
server.set("views", __dirname + "/public/views");
server.use(express.static(__dirname + "/public/assets"));

//HANDLES ALL ROUTE REQUEST FOR THE PORTAL;
server.use("/", routeIndex);

server.listen(PORT, () =>
  console.log(`listening to requests at port: ${PORT}`)
);
