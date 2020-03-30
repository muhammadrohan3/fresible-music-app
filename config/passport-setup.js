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
            "role",
            "type"
          ]
        })
      )
    );
    if (!user) return done(null, false);
    const { type: accountType } = user;
    delete user["type"];
    return done(null, { ...user, accountType });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = passport;
