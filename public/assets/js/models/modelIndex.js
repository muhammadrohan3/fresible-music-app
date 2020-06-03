import axios from "axios";
import "regenerator-runtime/runtime";
import pubSub from "../lib/pubSub";

export default class modelIndex {
  constructor() {
    this.requestInfo = {};
  }

  async get() {
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "GET",
    });
    return response;
  }

  async post(data) {
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "POST",
      data,
    });
    return response;
  }

  async update(data) {
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "PUT",
      data,
    });
    return response;
  }

  async delete() {
    const response = await this.serverRequest({
      ...this.requestInfo,
      method: "DELETE",
    });
    return response;
  }

  _urlNameReplacer(url, source) {
    if (url.includes("{")) {
      const urlParams = url.match(/\{(.*?)\}/g);
      urlParams.forEach((param) => {
        param = param.substr(1, param.length - 2);
        if (!source.hasOwnProperty(param)) {
          throw new Error("URLNAMEREPLACER: object missing url key " + param);
        }
        const keyValue = source[param];
        url = url.replace(`{${param}}`, keyValue);
        delete source[param];
      });
    }
    return url;
  }

  query(query, receivedParams = {}) {
    try {
      if (!this.queries[query]) throw new Error("QUERY NOT FOUND IN QUERIES");
      const foundQuery = this.queries[query];
      const { url, params = [] } = foundQuery;
      const formattedUrl = this._urlNameReplacer(url, receivedParams);
      for (const param of params) {
        if (!receivedParams[param])
          throw new Error(`QUERY PARAM MISSING KEY: ${param}`);
      }
      this.requestInfo = { params: { ...receivedParams }, url: formattedUrl };
      return this;
    } catch (err) {
      throw new Error(err);
    }
  }

  _onUploadProgress(progressEvent) {
    let value = 0;
    const { loaded, total } = progressEvent;
    value = Math.floor((loaded * 100) / total) + "%";
    if (total > 1000) {
      pubSub.publish("loader/uploading", [value]);
    }
  }

  async serverRequest({ url, method, data, params }) {
    const _errorHandler = (status, message) => ({ status, message });

    if (
      url &&
      !location.origin.includes("localhost") &&
      !window.navigator.onLine
    ) {
      return {
        status: "error",
        data: "Your internet connection is not active, do turn it on if off",
      };
    }
    const trim = (text) => (text.startsWith("/") ? text.substr(1) : text);
    if (location.host.includes("localhost")) {
      console.log(
        `MAKING A ${method} REQUEST TO ${url}, params - data `,
        params,
        data
      );
    }
    try {
      pubSub.publish("loader/loading", true);
      const response = await axios({
        url,
        method,
        data,
        onUploadProgress: this._onUploadProgress,
        params,
      });
      pubSub.publish("loader/loading", false);
      return response.data;
    } catch (err) {
      pubSub.publish("loader/loading", false);
      console.log(err);
      if (err.status === 404)
        return _errorHandler("error", "url or resource not found");
      if (String(err.status).startsWith("5"))
        return _errorHandler(
          "error",
          "Something went wrong, try again, if error persist's, contact admin"
        );
      throw new Error(err);
    }
  }
}
