const { Log } = require("../database/models");
const urlFormer = require("./util/urlFormer");
const myEmitter = require("../Events");

const actionCompleter = action => {
  switch (action.toLowerCase()) {
    case "registered":
      return "registered a new account";
    case "subscribed":
      return "subscribed to a";
    case "submitted":
      return "submitted a new";
    case "initiated":
      return "initiated a new";
    case "deleted":
      return "deleted a";
    case "declined":
      return "declined a";
    case "approved":
      return "approved a";
    case "activated":
      return "activated a";
    default:
      return false;
  }
};

const linker = (name, id) => {
  if (!name) return;
  if (/^(package|subscription)$/.test(name))
    return urlFormer("/subscription", { id });
  if (/^(release|submission)$/.test(name))
    return urlFormer("/submission", { id });
  if (/^(user|subscriber)$/.test(name)) return urlFormer("/subscriber", { id });
  if (/^payments?$/.test(name)) return urlFormer("/payments/single", { id });
  return urlFormer(`/${name}`, { id });
};

const handleAdminLog = ({ schemaQuery, user, schemaData }, schema, action) => {
  // if(action === "create") {
  //   const { id: userId } = user;

  // }

  if (action === "update") {
    const { id: userId } = user;
    const { id } = schemaQuery;
    const { status, linkId } = schemaData;
    if (schema === "release") {
      if (status)
        return logIt({
          userId,
          action: actionCompleter(status),
          type: schema,
          link: linker(schema, id),
          role: "admin"
        });
      if (linkId)
        return logIt({
          userId,
          action: "added store links to",
          type: schema,
          link: linker(schema, id),
          role: "admin"
        });
    }
    if (schema === "userpackage") {
      return (
        status === "active" &&
        logIt({
          userId,
          action: "activated a",
          type: "subscription",
          link: linker("subscription", id),
          role: "admin"
        })
      );
    }
    if (schema === "user") {
      const { role } = schemaData;
      return (
        role &&
        logIt({
          userId,
          action: "updated role for",
          type: "user",
          link: linker("user", id),
          role: "admin"
        })
      );
    }
  }
};

const handleSubscribersLog = (
  { schemaResult, schemaQuery, user, schemaData },
  schema,
  action
) => {
  const { id: userId } = user || {};
  if (action === "create") {
    const { id } = schemaResult;
    if (schema === "release") {
      return logIt({
        userId,
        action: actionCompleter("initiated"),
        type: schema,
        link: linker(schema, id)
      });
    }
    if (schema === "userpackage") {
      return logIt({
        userId,
        action: actionCompleter("subscribed"),
        type: "package",
        link: linker("package", id)
      });
    }
    if (schema === "payment") {
      return logIt({
        userId,
        action: actionCompleter("initiated"),
        type: schema,
        link: linker(schema, id)
      });
    }
    if (schema === "userProfile") {
      return logIt({ userId, action: "created a profile" });
    }
    if (schema === "user") {
      return logIt({ userId: id, action: "signed up" });
    }
  }

  if (action === "update") {
    const { id } = schemaQuery;
    const { status } = schemaData;
    if (schema === "release") {
      return (
        status &&
        logIt({
          userId,
          action: actionCompleter("submitted"),
          type: schema,
          link: linker(schema, id)
        })
      );
    }
    if (schema === "payment") {
      return (
        status === "success" &&
        logIt({
          userId,
          action: "completed a",
          type: schema,
          link: linker(schema, id)
        })
      );
    }
    if (schema === "userpackage") {
      return (
        status === "active" &&
        logIt({
          userId,
          action: actionCompleter("activated"),
          type: "subscription",
          link: linker("subscription", id)
        })
      );
    }
    if (schema === "user") {
      const { isVerified } = schemaData;
      return (
        schemaData.hasOwnProperty(isVerified) &&
        logIt({ userId, action: "verified account email" })
      );
    }
  }
};

module.exports = (data, schema, action, url) => {
  if (url.includes("fmadmincp")) return handleAdminLog(data, schema, action);
  return handleSubscribersLog(data, schema, action);
};

const logIt = ({ userId, action, type, link, role = "subscriber" }) => {
  console.log("LOGGER PARAMS: ", userId, action, type, link, role);
  myEmitter.emit("log", { userId, action, type, link, role }, Log);
  return;
};
