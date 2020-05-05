import axios from "axios";
import "regenerator-runtime/runtime";
import pubSub from "../lib/pubSub";

export default class modelIndex {
  constructor() {
    this.requestInfo = null;
  }

  async get() {
    if (!this.requestInfo) throw new Error("REQUEST INFO MISSING");
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "GET",
    });
    return response;
  }

  async post(data) {
    if (!this.requestInfo) throw new Error("REQUEST INFO MISSING");
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "POST",
      data,
    });
    return response;
  }

  async put(data) {
    if (!this.requestInfo) throw new Error("REQUEST INFO MISSING");
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "PUT",
      data,
    });
    return response;
  }

  async delete() {
    if (!this.requestInfo) throw new Error("REQUEST INFO MISSING");
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "DELETE",
    });
    return response;
  }

  onUploadProgress(progressEvent) {
    let value = 0;
    const { loaded, total } = progressEvent;
    value = Math.floor((loaded * 100) / total) + "%";
    if (total > 1000) {
      pubSub.publish("loader/loading", [value]);
    }
  }

  async serverRequest({ url, method, data, params }) {
    const _errorHandler = (status, message) => ({ status, message });

    if (url && !url.includes("localhost") && !window.navigator.onLine) {
      return {
        status: "error",
        data: "Your internet connection is not active, do turn it on if off",
      };
    }
    const trim = (text) => (text.startsWith("/") ? text.substr(1) : text);
    if (location.host.includes("localhost")) {
      console.log(
        `MAKING A ${method} REQUEST TO ${href || url}, params - data `,
        params,
        data
      );
    }
    try {
      const response = await axios({
        url,
        method,
        data,
        onUploadProgress,
        params,
      });
      return response.data;
    } catch (err) {
      console.log(error);
      if (err.status === 404)
        return _errorHandler("error", "url or resource not found");
      if (String(err.status).startsWith("5"))
        return _errorHandler(
          "error",
          "Something went wrong, try again, if error persist's, contact admin"
        );
      return err;
    }
  }
}