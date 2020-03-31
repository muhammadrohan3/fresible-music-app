import serverRequest from "./serverRequest";
import Validations from "../../../Validations";
import uploadFile from "./uploadFile";
import { getStore } from "../Store";
import FormErrorHandler from "./formErrorHandler";

const submitForm = View => async (form, refresh) => {
  const {
    submiturl: SubmitUrl,
    validation,
    addinfo,
    query_include,
    mixed,
    groups
  } = form.dataset;
  //if the form requires adding params to the url (query_include)
  const submitURL =
    SubmitUrl && query_include ? SubmitUrl + location.search : SubmitUrl;
  //Refresh means the form should handle what happens next after submission
  if (refresh) View.showLoader(true);
  let { rawFormData, isThereFile, isThereDate } = View.getFormData(form, mixed);
  //INITIATES THE FORM ERROR HANDLER WITH THE VIEW OBJECT
  const formErrorHandler = FormErrorHandler(View);
  const validationErrors = validation
    ? Validations[validation](rawFormData)
    : "";
  //CHECKS IF THERE IS ANY VALIDATION ERROR AND RETURNS FORM ERROR HANDLER
  if (validationErrors) {
    View.showLoader(false);
    View.showAlert(
      "Ooops!, one or more of your inputs did not pass validation, please correct..."
    );
    return formErrorHandler(form, validationErrors);
  }

  //THIS CLEARS THE FORM... (OPTIONAL)
  formErrorHandler(form, validation);

  const _isEmpty = obj => !Boolean(Object.entries(obj).length);

  if (_isEmpty(rawFormData)) {
    if (refresh)
      return View.showAlert("No new values submitted, nothing changed.");
    return {
      status: "error",
      data: "No new values submitted, nothing changed."
    };
  }

  // A WORK AROUND TO HANDLE RELEASE DATE
  if (isThereDate.length) {
    for (let date of isThereDate) {
      let [name, required] = date;
      if (required && !rawFormData[name])
        return "Please select a date from the calendar... (on a mobile phone? try other dates)";
    }
  }
  // FILE TYPE HANDLER
  if (isThereFile.length) {
    for (let file of isThereFile) {
      let [name, required] = file;
      if (required && !rawFormData[name])
        return View.showAlert("Please upload required file(s)");
    }
    for (let file of isThereFile) {
      let [name] = file;
      if (getStore("files")[name]) {
        const response = await uploadFile(name);
        if (response) {
          const { secure_url } = response;
          rawFormData = { ...rawFormData, [name]: secure_url };
        }
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

  //DEFAULT (THESE RUNS AFTER THE GROUP IF THERE IS ANY)... Its the default form submitter.
  const response = await makeRequest(submitURL, rawFormData);
  //refresh means the submitForm function should continue and refresh the page afterwards
  if (!refresh) return response;
  if (response.status === "error") return View.showAlert(response.data, true);
  return View.refresh();

  async function makeRequest(href, data) {
    const response = await serverRequest({
      href: href || `${location.pathname}${location.search}`,
      data: data
    });
    return response;
  }
};

export default submitForm;
