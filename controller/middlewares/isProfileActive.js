const handleResponse = require("../util/handleResponse");

const isProfileActive = ({ req, res }) => () => {
  if (!req.user || req.user.role !== "subscriber") return;
  const handle = (route, param) => {
    if (!route) {
      if (req.cookies.profileSetup) res.clearCookie("profileSetup");
      return;
    }
    res.cookie("profileSetup", param, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: false,
    });
    const allowedRoutes = [
      "/favicon.ico",
      "/profile-setup",
      "/auth/vtc",
      "/faqs",
      "/contact-us",
      "/profile",
      "/logout",
    ];

    //CONDITION TO CALL AN HANDLER IF THE SUBSCRIBER IS NOT A LABEL ON THE COMPULSORY ADD ARTIST ROUTE
    if (req.user.profileActive === 3 && req.user.type !== "label") {
      return req.path === "/profile-setup/skip-add-artist"
        ? null
        : handleResponse("redirect", "/profile-setup/skip-add-artist");
    }

    if (
      allowedRoutes.includes(req.path) ||
      req.path.startsWith(route) ||
      (req.method === "post" && req.path.startsWith("/confirm-account"))
    )
      return;
    return handleResponse("redirect", route);
  };
  switch (req.user.profileActive) {
    case 0:
      return handle("/select-account", 1);
    case 1:
      return handle("/complete-profile", 2);
    case 2:
      return handle("/confirm-account", 3);
    case 3:
      return handle("/artists/add-artist", 4);
    case 4:
      return handle("/select-package", 5);
    case 5:
      return handle("/add-music", 6);
    case 6:
      return handle("/payment", 7);
    default:
      return handle(false);
  }
};

module.exports = { isProfileActive };
