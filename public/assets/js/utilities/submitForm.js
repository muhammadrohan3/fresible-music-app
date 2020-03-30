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
  let { groupData, rawFormData, isThereFile, isThereDate } = View.getFormData(
    form,
    mixed
  );
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
      return data[key] && { ...acc, [key]: data[key] };
    }, {});

  //GROUPING HANDLER
  if (groups) {
    //parses the data (data-groups from the form attributes)
    const parsedGroups = JSON.parse(groups);
    //Loops through each items of the group
    for (item of parsedGroups) {
      //Gets the object Data;
      const { href, name, set } = item;
      //Gets the input names of the form associated with the current group from the groupData received from View.getFormData
      const keys = groupData[name];
      //Gets the key=value pair of the keys from the form data itself (rawFormData);
      const data = _dataExtractor(rawFormData, keys);
      //Submits the post request to the href specified by the group
      const response = await makeRequest(href, data);
      //If the value of the response gotten from the server for the current group is needed in another group (e.g, set = 'default' )
      if (set) {
        //Loops through each of the keys
        keys.forEach(([key, setKey]) => {
          //if this key should set add a value to another group, ther should be a setKey,
          //sets the rawFormData obj with the value of the setKey value in the response object from the server
          if (setKey) {
            //sets the form data object
            rawFormData[setKey] = response[setKey];
            //pushes the setKey name to that particular group key list.
            groupData[set].push(setKey);
          }
        });
      }
    }
  }

  //DEFAULT (THESE RUNS AFTER THE GROUP IF THERE IS ANY)... Its the default form submitter.
  const data = _dataExtractor(rawFormData, groupData["default"]);
  const response = await makeRequest(submitURL, data);
  //refresh means the submitForm function should continue and refresh the page afterwards
  if (!refresh) return response;
  if (response.status === "error") return View.showAlert(response.data, true);
  return View.refresh();

  async function makeRequest(href, data) {
    const response = await serverRequest({
      href: href || `${location.pathname}${location.search}`,
      data: data
    });
    return response.data;
  }
};

export default submitForm;
