const passport = require("passport");
const { User } = require("../database/models");

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
            "avatar",
            "email",
            "role"
          ]
        })
      )
    );
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = passport;
