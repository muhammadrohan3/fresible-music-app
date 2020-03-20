"use strict";
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define(
    "submissions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userPackageId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      artiste: DataTypes.STRING,
      featured: DataTypes.STRING,
      genre: DataTypes.STRING,
      releaseDate: DataTypes.STRING,
      artwork: DataTypes.STRING,
      music: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM,
        values: ["incomplete", "processing", "approved", "declined"]
      },
      submitStatus: DataTypes.INTEGER
    },
    {
      timestamps: true
    }
  );

  Submission.associate = function({ User, Userpackage }) {
    // Submission belongsTo User
    this.belongsTo(User, { foreignKey: "userId", as: "user" });

    // Submission belongsTo User
    this.belongsTo(Userpackage, { foreignKey: "userPackageId", as: "package" });
  };
  return Submission;
};
