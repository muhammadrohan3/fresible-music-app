const {
  // User,
  // Userprofile,
  // Userpackage,
  // Package,
  // Payment,
  // Track,
  // Video,
  // Album,
  Albumtrack,
  // Release,
  // Log,
  // Link,
  // Labelartist
  Sequelize
} = require("./database/models/index");

(async () => {
  try {
    const data = JSON.parse(
      JSON.stringify(
        await Albumtrack.destroy({
          where: { id: [42382] }
        })
      )
    );
    console.log(data);
  } catch (e) {
    console.log(e);
  }
})();
