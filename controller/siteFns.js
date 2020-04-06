const crypto = require("crypto");
const path = require("path");
const moment = require("moment");
const idLookUp = require("./util/idLookUp");
// const dateSet = require("date-fns/set");

const viewsDir = path.join(__dirname, "../public", "/views");

module.exports = () => ({
  getRandomId: (size = 5) =>
    crypto.randomBytes(size).toString("base64").slice(0, size),
  idLookUp: (num) => num,
  colorText: (text) => {
    let textColorMap = {
      processing: "info",
      active: "success",
      inactive: "danger",
      incomplete: "warning",
      approved: "success",
      "in stores": "success",
      declined: "danger",
      deleted: "danger",
      expired: "default",
      success: "success",
      failed: "danger",
    };
    return textColorMap[text];
  },
  formatCurrency: (number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number),
  cloudinaryUrl: (type) =>
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${
      type || "image"
    }/upload`,
  token: (n = 5) => {
    let token = "";
    for (let i = 1; i <= n; i++) {
      token += Math.floor(Math.random() * 9);
    }
    return token;
  },
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  dateFormat: (date) => date && moment(date).format("YYYY-MM-DD"),
  nextYear: (date) => date && moment(date).add(1, "year").format("YYYY-MM-DD"),
  dateTimeFormat: (date) => date && moment(date).format("YYYY-MM-DD h:mma"),
  dirs: { viewsDir },
  filter: (list, key) => list.filter((item) => item !== key),
  packageSelectHandler: ({
    package: { package, maxTracks, maxAlbums },
    releases,
  }) => {
    let notApplicable = "";
    let trackCount = 0;
    let albumCount = 0;
    let albumStatus;
    let trackStatus;
    releases.forEach(({ type }) =>
      type === "album" ? albumCount++ : trackCount++
    );
    if (trackCount >= maxTracks && albumCount >= maxAlbums) return false;

    if (maxAlbums > 0) {
      albumCount === maxAlbums && (notApplicable = "album/full");
      albumStatus = `${albumCount} of ${maxAlbums}`;
    } else {
      notApplicable = "album";
      albumStatus = "Not applicable";
    }

    if (maxTracks > 0) {
      trackCount === maxTracks && (notApplicable = "track/full");
      trackStatus = `${trackCount} of ${maxTracks}`;
    } else {
      notApplicable = "track";
      trackStatus = "Not Applicable";
    }
    return { notApplicable, trackCount, trackStatus, albumStatus, albumCount };
  },
});
