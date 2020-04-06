const { Userpackage } = require("../database/models/index");

(async () => {
  const subscriptions = JSON.parse(
    JSON.stringify(await Userpackage.findAll({}))
  );

  const response = await Promise.all(
    subscriptions.map(async ({ id, status, paymentDate, updatedAt }) => {
      const requestData = {};
      if (status === "active") {
        !paymentDate && (requestData["paymentDate"] = updatedAt);
      }
      if (!Object.values(requestData).length) return false;
      const res = await Userpackage.update(requestData, { where: { id } });
      return JSON.parse(JSON.stringify(res));
    })
  );
  console.log(response);
})();
