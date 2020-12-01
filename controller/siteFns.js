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
      pending: "info",
      processing: "info",
      active: "success",
      inactive: "danger",
      incomplete: "warning",
      approved: "success",
      published: "success",
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
  capitalize: (text = "") => {
    return (
      text &&
      text
        .toLowerCase()
        .trim()
        .split(" ")
        .map((t) => t[0].toUpperCase() + t.substr(1))
        .join(" ")
    );
  },
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  dateFormat: (date, raw = false) => {
    if (!date) return;
    if (raw) return moment(date).format("YYYY-MM-DD");
    return moment(date).format("Do MMM, YYYY");
  },
  monthFormat: (month) => {
    return moment(month, "MM").format("MMMM");
  },
  nextYear: (date) => date && moment(date).add(1, "year").format("YYYY-MM-DD"),
  dateTimeFormat: (date) => date && moment(date).format("YYYY-MM-DD h:mma"),
  dirs: { viewsDir },
  filter: (list, key) => list.filter((item) => item !== key),
  convertObjArray: (objArray = [], keys = []) => {
    return objArray.map((obj) => keys.map((key) => obj[key]));
  },
  cloudinaryDynamicSize: (link, width = 600, height = 500) => {
    if (!link) return;
    const dynamicString = `upload/w_${width},h_${height}/`;
    const [part1, part2] = link.split("upload/");
    return [part1, dynamicString, part2].join("");
  },
  formatNumber: (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "G+";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
    }
    return num;
  },
});
