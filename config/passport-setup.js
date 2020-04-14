const passport = require("passport");
const { User, Userprofile, Upload } = require("../database/models");

//USER PASSPORT CONFIGURATION;
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = JSON.parse(
      JSON.stringify(
        await User.findOne({
          where: { id },
          attributes: [
            "id",
            "profileActive",
            "isVerified",
            "firstName",
            "email",
            "role",
            "type",
          ],
        })
      )
    );
    if (!user) return done(null, false);
    const { userAvatar = "" } =
      JSON.parse(
        JSON.stringify(
          await Userprofile.findOne({
            where: { userId: id },
            include: { model: Upload, as: "userAvatar" },
          })
        )
      ) || {};

    return done(null, { ...user, avatar: userAvatar });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = passport;
