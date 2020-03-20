import { getStore } from "../Store";
import serverRequest from "./serverRequest";

export default async (name, fileInfo) => {
  const { upload_preset, file, public_id, url } = name
    ? getStore(name)
    : fileInfo;
  const uploadForm = new FormData();
  uploadForm.append("upload_preset", upload_preset);
  uploadForm.append("file", file);
  uploadForm.append("public_id", public_id);
  const response = await serverRequest({
    url,
    contentType: "hi",
    data: uploadForm
  });
  return await response;
};
