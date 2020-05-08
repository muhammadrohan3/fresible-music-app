import serverRequest from "../utilities/serverRequest";
import shortId from "shortid";

export default class CloudinaryFileUploader {
  constructor(configOptions) {
    this.configOptions = configOptions || null;
  }

  config(configOptions) {
    const { upload_preset, public_id, url } = configOptions;
    if (upload_preset && public_id && url) {
      this.configOptions = configOptions;
      return this;
    }
    throw new Error(
      "CLOUDINARY-FILE-UPLOADER: config options incomplete or undefined"
    );
  }

  async upload(file) {
    debugger;
    let { upload_preset, public_id, url } = this.configOptions;
    const uploadForm = new FormData();
    public_id = public_id.concat(shortId.generate());
    uploadForm.append("upload_preset", upload_preset);
    uploadForm.append("file", file);
    uploadForm.append("public_id", public_id);
    try {
      const response = await serverRequest({
        url,
        contentType: "hi",
        data: uploadForm,
      });
      if (response.existing === true) return this.upload(file);
      debugger;
      return { status: "success", data: response };
    } catch (err) {
      console.log("FILE UPLOADER: ", err);
      return err;
    }
  }
}
