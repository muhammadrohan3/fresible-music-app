const passport = require("passport");
const { User, Userprofile } = require("../database/models");

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
            "profileSetup",
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
    const { avatar } =
      JSON.parse(
        JSON.stringify(
          await Userprofile.findOne({
            where: { userId: id },
          })
        )
      ) || {};

    return done(null, { ...user, avatar });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = passport;
