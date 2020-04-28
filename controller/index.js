const wrapper = require("./wrapper");
const middlewares = require("./middlewares");

module.exports = function () {
  const middlewareHash = middlewares.reduce(
    (acc, [fnName, fn]) => ({ ...acc, [fnName]: wrapper(fn, fnName) }),
    {}
  );
  return middlewareHash;
};
