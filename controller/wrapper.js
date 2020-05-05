const wrapperHandler = (payload, req, res, next, fname) => {
  // console.log("done with: ", fname, " via route ", req.baseUrl + req.path);
  const { data, type } = payload || {};
  if (type && data) {
    if (type === "error") {
      console.log(data);
      return next(data);
    }
    if (type === "render" && ([page, values] = data))
      return res.render(page, values);
    if (type === "send") return res.send(data);
    if (type === "json") return res.json(data);
    if (type === "redirect") return res.redirect(data);
  }
  return next();
};

module.exports = (fn, name) => (...params) => async (req, res, next) => {
  let store = res.locals;
  const clearStore = () => (store = {});
  const setStore = (key, data) => {
    const keyRoute = typeof key === "string" ? [key] : key;

    //
    const setter = (store, route = [], index = 0) => {
      const currentRoute = route[index];
      const currentRouteData = store[currentRoute];
      if (index === route.length - 1) {
        if (Array.isArray(data)) {
          store = {
            ...store,
            [currentRoute]: [...(currentRouteData || []), ...data],
          };
        } else if (data === null) {
          store = { ...store, [currentRoute]: null };
        } else if (typeof data === "object") {
          store = {
            ...store,
            [currentRoute]: { ...(currentRouteData || {}), ...data },
          };
        } else {
          store = { ...store, [currentRoute]: data };
        }
        return store;
      }

      store = {
        ...store,
        [currentRoute]: setter(currentRouteData, route, index + 1),
      };
      return store;
    };

    res.locals = store = setter(store, keyRoute);
    return;
  };
  const getStore = (key) => {
    return key ? store[key] : store;
  };

  try {
    let fname = name || fn.name;
    process.env.NODE_ENV !== "production" &&
      console.log(
        "currently on: ",
        fname,
        " via route ",
        req.baseUrl + req.path,
        " method: ",
        req.method
      );
    let run = fn({ setStore, getStore, req, res });
    if (typeof run === "function") run = await run.apply(null, params);
    return wrapperHandler(run, req, res, next, fname);
  } catch (err) {
    if (req.method === "get")
      res.send("ERROR: SOMETHING WENT WRONG (NOTIFY ADMIN)");
    else
      res.json({
        status: "error",
        data: "ERROR: SOMETHING WENT WRONG (NOTIFY ADMIN)",
      });
    next(err);
  }
};
