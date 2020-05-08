import CloudinaryFileUploader from "../lib/cloudinaryFileUploader";

const FileUploader = new CloudinaryFileUploader();

export default class ControllerIndex {
  constructor() {}

  async uploadToCloudinary(filesToUpload = [], filesObj) {
    const fileUrlMap = {};
    if (!filesToUpload.length) return;
    await Promise.all(
      filesToUpload.map(async (fileName) => {
        const { options, file } = filesObj[fileName];
        const response = await FileUploader.config(options).upload(file);

        if (response.status !== "success")
          throw new Error("Uploading file error: " + fileName);
        fileUrlMap[fileName] = response.data.secure_url;
      })
    );
    return fileUrlMap;
  }
}
