const multer = require("multer");
const { getStore, setStore } = require("./store");

const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const { fieldname, mimetype } = file;
      const [type] = mimetype.split("/");
      let folder;
      if (type === "image")
        folder = `./public/assets/images/uploads/${fieldname}s`;
      else folder = `./uploads/${fieldname}s`;
      cb(null, folder);
    },
    filename: function(req, file, cb) {
      console.log("FILENAME: ", file);
      const { originalname, fieldname } = file;
      const fileExtension = path.extname(originalname);
      let fileName = `${fieldname}-${getStore("token")}${fileExtension}`;
      setStore("fileUploaded", true);
      setStore("schemaData", { [fieldname]: fileName });
      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    console.log("FILEFILER: ", file);
    const [type] = file.mimetype.split("/");
    let rule;
    if (type === "image") rule = /.*\.(png|jpg|jpeg|gif|ico)$/i;
    if (type === "audio") rule = /.*\.(mp3|wav)$/i;
    let fileExt = file.originalname.match(rule);
    if (!fileExt) return cb("File format invalid", false);
    setStore("fileIndex", getStore("fileIndex") + 1);
    cb(null, true);
  };

  const limits = {
    fileSize: getStore("fileSizes")[getStore("fileIndex")] * 1000000
  };

  return multer({ storage, limits, fileFilter });
};

module.exports = uploadFile;
