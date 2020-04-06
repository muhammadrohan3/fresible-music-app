const { Log } = require("../database/models");
const urlFormer = require("./util/urlFormer");
const myEmitter = require("../Events");

const actionCompleter = (action) => {
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
  if (/^(package|subscription)s?$/.test(name))
    return urlFormer("/subscription", { id });
  if (/^(release|submission)s?$/.test(name))
    return urlFormer("/submission", { id });
  if (/^(user|subscriber)s?$/.test(name))
    return urlFormer("/subscriber", { id });
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
    if (schema === "release" || schema === "releases") {
      schema = "release";
      if (status)
        return logIt({
          userId,
          action: actionCompleter(status),
          type: schema,
          link: linker(schema, id),
          role: "admin",
        });
      if (linkId)
        return logIt({
          userId,
          action: "added store links to",
          type: schema,
          link: linker(schema, id),
          role: "admin",
        });
    }
    if (schema === "userpackage" || schema === "userpackages") {
      return (
        status === "active" &&
        logIt({
          userId,
          action: "activated a",
          type: "subscription",
          link: linker("subscription", id),
          role: "admin",
        })
      );
    }
    if (schema === "user" || schema === "users") {
      const { role, type } = schemaData;

      if (type === "label") {
        return logIt({
          userId,
          action: "changed account to label for",
          type: "user",
          link: linker("user", id),
          role: "admin",
        });
      }
      if (role) {
        return (
          role &&
          logIt({
            userId,
            action: "updated role for",
            type: "user",
            link: linker("user", id),
            role: "admin",
          })
        );
      }
    }
  }
};

const handleSubscribersLog = (
  { schemaResult, schemaQuery, user, schemaData, tempKey },
  schema,
  action
) => {
  const { id: userId, type } = user || {};
  if (action === "create") {
    const { id } = schemaResult || {};
    if (schema === "release" || schema === "releases") {
      schema = "release";
      return logIt({
        userId,
        action: actionCompleter("initiated"),
        type: schema,
        link: linker(schema, id),
      });
    }
    if (schema === "userpackage" || schema === "userpackages") {
      return logIt({
        userId,
        action: actionCompleter("subscribed"),
        type: "package",
        link: linker("package", id),
      });
    }
    if (schema === "payment" || schema === "payments") {
      schema = "payment";
      return logIt({
        userId,
        action: actionCompleter("initiated"),
        type: schema,
        link: linker(schema, id),
      });
    }
    if (schema === "userprofile" || schema === "userprofiles") {
      if (type === "label")
        return logIt({ userId, action: "created a label profile" });
      return logIt({ userId, action: "created an artiste profile" });
    }
    if (schema === "user" || schema === "users") {
      return logIt({ userId: schemaResult.id, action: "signed up" });
    }
  }

  if (action === "update") {
    const { id } = schemaQuery;
    const { status } = schemaData;
    if ((schema === "release" || schema === "releases") && status) {
      schema = "release";
      if (status !== "processing") return;
      const { oldStatus } = tempKey;
      if (oldStatus === "declined") {
        return logIt({
          userId,
          action: "re-submitted a",
          type: schema,
          link: linker(schema, id),
        });
      }
      return logIt({
        userId,
        action: actionCompleter("submitted"),
        type: schema,
        link: linker(schema, id),
      });
    }
    if (schema === "payment" || schema === "payments") {
      schema = "payment";
      return (
        status === "success" &&
        logIt({
          userId,
          action: "completed a",
          type: schema,
          link: linker(schema, id),
        })
      );
    }
    if (schema === "userpackage" || schema === "userpackages") {
      return (
        status === "active" &&
        logIt({
          userId,
          action: actionCompleter("activated"),
          type: "subscription",
          link: linker("subscription", id),
        })
      );
    }
    // if (schema === "user") {
    //   const { isVerified } = schemaData;
    //   return isVerified && logIt({ userId, action: "verified account email" });
    // }
  }
};

module.exports = (data, schema, action, url) => {
  if (url.includes("fmadmincp"))
    return handleAdminLog(data, schema.toLowerCase(), action);
  return handleSubscribersLog(data, schema.toLowerCase(), action);
};

const logIt = ({ userId, action, type, link, role = "subscriber" }) => {
  myEmitter.emit("log", { userId, action, type, link, role }, Log);
  return;
};
