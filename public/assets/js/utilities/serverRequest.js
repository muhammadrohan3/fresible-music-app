import axios from "axios";
import "regenerator-runtime/runtime";
import View from "../View";

export default async ({ url, href, method, contentType, data }) => {
  const trim = text => (text.startsWith("/") ? text.substr(1) : text);
  try {
    const response = await axios({
      url:
        url ||
        `${location.origin}/${(href && trim(href)) ||
          trim(location.pathname + location.search)}`,
      method: method || "post",
      data,
      withCredentials: false,
      onUploadProgress: progressEvent => {
        let value = 0;
        const { loaded, total } = progressEvent;
        value = Math.floor((loaded * 100) / total) + "%";
        if (total > 1000) View.loaderText(value);
      }
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
