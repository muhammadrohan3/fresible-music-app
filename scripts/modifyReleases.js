require("dotenv").config();
const { Release } = require("../database/models/index");

(async () => {
  const releases = JSON.parse(JSON.stringify(await Release.findAll({})));

  const response = await Promise.all(
    releases.map(async ({ id, linkId, status, approvedDate, updatedAt }) => {
      const requestData = {};
      if (status === "approved") {
        !approvedDate && (requestData["approvedDate"] = updatedAt);
        linkId && (requestData["status"] = "in stores");
      }
      if (!Object.values(requestData).length) return false;
      const res = await Release.update(requestData, { where: { id } });
      return JSON.parse(JSON.stringify(res));
    })
  );
  console.log(response);
})();
