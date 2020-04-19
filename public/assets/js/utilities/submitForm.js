import serverRequest, { responseHandler } from "./serverRequest";
import Validations from "../../../Validations";
import uploadFile from "./uploadFile";
import { getStore } from "../Store";
import validator from "./validator";

const submitForm = (View) => async (form, formOptions = {}) => {
  const {
    submiturl,
    validation,
    addinfo,
    query_include,
    query_params,
    groups,
  } = form.dataset;

  const { refresh = false, strict = true } = formOptions;
  //if the form requires adding params to the url (query_include)
  let R;
  let QueryParams = {};
  if (query_include) {
    const paramList = window.location.search.split("?")[1].split("&");
    paramList.forEach((p) => {
      const [key, value] = p.split("=");
      QueryParams[key] = value;
    });
  }
  if (query_params) {
    const params = JSON.parse(query_params);
    params.forEach((p) => (QueryParams = { ...QueryParams, ...p }));
  }
  //Refresh means the form should handle what happens next after submission
  if (refresh) View.showLoader(true);
  let { rawFormData, isThereFile } = View.getFormData(form);

  const _isEmpty = (obj) => !Boolean(Object.entries(obj).length);

  if (_isEmpty(rawFormData) && !isThereFile.length) {
    if (refresh)
      return View.showAlert("No new values submitted, nothing changed.");
    return {
      status: "empty",
      data: "No new values submitted, nothing changed.",
    };
  }

  //INITIATES THE FORM ERROR HANDLER WITH THE VIEW OBJECT
  if (!validator(form, null, validation) && strict) {
    if (refresh)
      return View.showAlert(
        "Ooops!, one or more of your inputs did not pass validation."
      );
    return {
      status: "error",
      data: "Ooops!, one or more of your inputs did not pass validation.",
    };
  }

  // FILE TYPE HANDLER
  if (isThereFile.length) {
    for (let file of isThereFile) {
      let [name, required] = file;
      const fileInStore = getStore("files")[name];
      if (!strict && !fileInStore) continue;
      if (required && !fileInStore)
        return View.showAlert("Please upload required file(s)");
    }
    for (let file of isThereFile) {
      let [name] = file;
      const fileInStore = getStore("files")[name];
      if (fileInStore) {
        const response = await uploadFile(name);
        if (!(R = responseHandler(response))) return { status: "error" };
        const { secure_url } = R;
        rawFormData = { ...rawFormData, [name]: secure_url };
      }
    }
  }

  //INFO TO BE ADDED ALONG WITH THE FORM TO BE SUBMITTED
  if (addinfo) {
    //parses the embedded json data
    let infoObj = JSON.parse(addinfo);
    for (let item in infoObj) {
      if (infoObj.hasOwnProperty(item)) {
        let value = infoObj[item];
        let numValue = parseInt(value);
        //checks if the particular data should be a number
        if (!isNaN(numValue)) value = numValue;
        rawFormData = { ...rawFormData, [item]: value };
        groups["default"].push(item);
      }
    }
  }

  const _dataExtractor = (data, keys) =>
    keys.reduce((acc, curr) => {
      //checks if the curr (current) item is an array or a string.
      let key = Array.isArray(curr) ? curr[0] : curr;
      //returns a new object with the updated key=value pair
      return data[key] ? { ...acc, [key]: data[key] } : acc;
    }, {});

  //AVOID SETTING ID OF A SCHEMA DIRECTLY
  delete rawFormData["id"];

  //GROUPING HANDLER
  if (groups) {
    //parses the data (data-groups from the form attributes)
    const parsedGroups = JSON.parse(groups);
    //Loops through each items of the group
    for (let item of parsedGroups) {
      //Gets the object Data;
      const { href, names } = item;
      //Gets the key=value pair of the keys from the form data itself (rawFormData);
      const postData = _dataExtractor(rawFormData, names);
      //Submits the post request to the href specified by the group
      const { data, status } = await makeRequest(href, postData);
      if (status === "error") return View.showAlert(data);
      //If the value of the response gotten from the server for the current group is needed in another group (e.g, set = 'default' )
      rawFormData = { ...rawFormData, ...data };
    }
  }

  // DEFAULT (THESE RUNS AFTER THE GROUP IF THERE IS ANY)... Its the default form submitter.
  const response = await makeRequest(submiturl, rawFormData, QueryParams);
  //refresh means the submitForm function should continue and refresh the page afterwards
  if (!refresh) return response;
  if (response.status === "error") return View.showAlert(response.data, true);
  return View.refresh();

  async function makeRequest(href, data, params = {}) {
    const response = await serverRequest({
      href: href || `${location.pathname}${location.search}`,
      data: data,
      params,
    });
    return response;
  }
};

export default submitForm;
