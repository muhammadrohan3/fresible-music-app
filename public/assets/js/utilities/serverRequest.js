import axios from "axios";
import "regenerator-runtime/runtime";
import View from "../View";

export default async ({
  url,
  href,
  method = "POST",
  contentType,
  data,
  params,
}) => {
  if (url && !url.includes("localhost") && !window.navigator.onLine)
    return {
      status: "error",
      data: "Your internet connection is not active, do turn it on if off",
    };
  const trim = (text) => (text.startsWith("/") ? text.substr(1) : text);
  console.log(`MAKING A ${method} request to: `, href, params, data);
  try {
    const response = await axios({
      url:
        url ||
        `${location.origin}/${
          (href && trim(href)) || trim(location.pathname + location.search)
        }`,
      method,
      data,
      withCredentials: false,
      onUploadProgress: (progressEvent) => {
        let value = 0;
        const { loaded, total } = progressEvent;
        value = Math.floor((loaded * 100) / total) + "%";
        if (total > 1000) View.loaderText(value);
      },
      params,
    });
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

export const responseHandler = ({ status, data }, customMessage) => {
  //
  if (status === "error") {
    View.showAlert(customMessage || data);
    return false;
  }
  return data;
};
