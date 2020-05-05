import serverRequest from "../utilities/serverRequest";

export default class CloudinaryFileUploader {
  constructor() {
    this.configOptions = null;
  }

  config(configOptions) {
    const { upload_preset, public_id, url } = configOptions;
    debugger;
    if (upload_preset && public_id && url) {
      this.configOptions = configOptions;
      return this;
    }
    throw new Error(
      "CLOUDINARY-FILE-UPLOADER: config options incomplete or undefined"
    );
  }

  async upload(file) {
    const { upload_preset, public_id, url } = this.configOptions;
    const uploadForm = new FormData();
    uploadForm.append("upload_preset", upload_preset);
    uploadForm.append("file", file);
    uploadForm.append("public_id", public_id);
    try {
      const response = await serverRequest({
        url,
        contentType: "hi",
        data: uploadForm,
      });
      if (response.status) return response;
      return { status: "success", data: response };
    } catch (err) {
      console.log("FILE UPLOADER: ", err);
      return err;
    }
  }
}
