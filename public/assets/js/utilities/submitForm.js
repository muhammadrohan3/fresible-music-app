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
    mixed
  } = form.dataset;
  //if the form requires adding params to the url (query_include)
  const submiturl =
    SubmitUrl && query_include ? SubmitUrl + location.search : SubmitUrl;
  //Refresh means the form should handle what happens next after submission
  if (refresh) View.showLoader(true);
  let { formData, rawFormData, isThereFile, isThereDate } = View.getFormData(
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
      if (getStore(name)) {
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
    let infoObj = JSON.parse(addinfo);
    for (let item in infoObj) {
      if (infoObj.hasOwnProperty(item)) {
        let value = infoObj[item];
        let numValue = parseInt(value);
        if (!isNaN(numValue)) value = numValue;
        rawFormData = { ...rawFormData, [item]: value };
      }
    }
  }

  // MAKES THE REQUEST TO THE SERVER AND PROCEEDS WITHE APPROPRIATE ACTION
  const response = await serverRequest({
    href: submiturl || `${location.pathname}${location.search}`,
    data: rawFormData
  });
  if (!refresh) return response;
  if (response.status === "error") return View.showAlert(response.data, true);
  return View.refresh();
};

export default submitForm;
