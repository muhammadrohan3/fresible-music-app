const handleResponse = require("../util/handleResponse");
const valExtractor = require("../util/valExtractor");
const { User } = require("../../database/models/index");

const handleProfileSetupUpdate = ({ getStore, req }) => async (
  handlerId,
  userLocation = []
) => {
  let user = req.user;
  if (userLocation.length) {
    user = userLocation.length ? valExtractor(getStore(), userLocation) : id;
  }

  const { profileSetup, type, id } = user;
  if (!profileSetup || !type || !id)
    throw new Error("HANDLE PROFILE SETUP PARAMETER(S) MISSING");
  if (profileSetup === "completed" || handlerId !== profileSetup) return;

  const labelSetupRoute = [
    "select-account",
    "complete-profile",
    "add-artist",
    "select-package",
    "add-release",
    "payment",
    "completed",
  ];

  const subscriberSetupRoute = [
    "select-account",
    "complete-profile",
    "select-package",
    "add-release",
    "payment",
    "completed",
  ];

  let routeList = subscriberSetupRoute;
  if (type && type === "label") {
    routeList = labelSetupRoute;
  }
  const currentStepIndex = routeList.findIndex(
    (routeId) => routeId === profileSetup
  );
  const nextStep = routeList[currentStepIndex + 1];
  if (!nextStep) return;

  await User.update({ profileSetup: nextStep }, { where: { id } });
  return;
};

const isUserAccountOnSetup = ({ req, res }) => () => {
  if (!req.user || req.user.role !== "subscriber") return;
  const handle = (route) => {
    if (!route) return;
    const allowedRoutes = [
      "/favicon.ico",
      "/profile-setup",
      "/auth/vtc",
      "/faqs",
      "/contact-us",
      "/profile",
      "/logout",
    ];

    if (
      allowedRoutes.includes(req.path) ||
      req.path.startsWith(route) ||
      req.path.startsWith("/confirm-account")
    ) {
      return;
    }
    return handleResponse("redirect", route);
  };
  switch (req.user.profileSetup) {
    case "select-account":
      return handle("/select-account");
    case "complete-profile":
      return handle("/complete-profile");
    case "add-artist":
      return handle("/artists/add-artist");
    case "select-package":
      return handle("/select-package");
    case "add-release":
      return handle("/add-music");
    case "payment":
      return handle("/payment");
    default:
      return handle(false);
  }
};

module.exports = { isUserAccountOnSetup, handleProfileSetupUpdate };
