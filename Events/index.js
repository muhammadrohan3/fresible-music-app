const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on("error", (e, type) => console.log("EMITTER ERROR: ", type, e));

myEmitter.on("sendmail", async (schema, sendMail) => {
  try {
    const response = await sendMail(schema);
    console.log(response ? "MAIL SENT" : "MAIL NOT SENT");
  } catch (err) {
    myEmitter.emit("error", err, "MAIL NOT SENT");
  }
});

myEmitter.on("log", async (data, Log) => {
  try {
    console.log("LOGGING");
    await Log.create(data);
  } catch (err) {
    myEmitter.emit("error", err, "LOG NOT LOGGED");
  }
});

module.exports = myEmitter;
