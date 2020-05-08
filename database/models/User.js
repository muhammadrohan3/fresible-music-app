const uuid = require("uuidv4").default;
("use strict");
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      uid: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      token: DataTypes.STRING,
      tokenType: DataTypes.STRING,
      profileSetup: {
        type: DataTypes.ENUM,
        values: [
          "select-account",
          "complete-profile",
          "add-artist",
          "select-package",
          "add-release",
          "payment",
          "completed",
        ],
        defaultValue: "select-account",
      },
      isVerified: DataTypes.BOOLEAN,
      role: {
        type: DataTypes.ENUM,
        values: ["subscriber", "admin", "superAdmin"],
        defaultValue: "subscriber",
      },
      type: DataTypes.STRING,
    },
    {
      timestamps: true,
    }
  );

  User.beforeCreate((User) => (User.uid = uuid()));

  User.associate = function ({
    Package,
    Userpackage,
    Payment,
    Release,
    Userprofile,
  }) {
    //User hasMany Payments
    this.hasMany(Payment, { foreignKey: "userId", as: "payments" });

    //User belongsToMany Packages
    this.belongsToMany(Package, {
      through: Userpackage,
      foreignKey: "userId",
      as: "users",
    });

    //User hasMany Releases
    this.hasMany(Release, { foreignKey: "userId", as: "releases" });

    //User has a Userprofile
    this.hasOne(Userprofile, { foreignKey: "userId", as: "profile" });
  };
  return User;
};
