import formErrorHandler from "./formErrorHandler";
import View from "../View";
import Validations from "../Validations";

export default (form, data, validationName) => {
  !data && (data = View.getFormData(form).requiredData);
  let validationResponse = {};
  if (validationName) {
    let validationFn = Validations[validationName];
    validationFn && (validationResponse = validationFn(data));
  }
  let errors = { ...data, ...validationResponse };
  const wasAnySet = formErrorHandler(View)(form, errors);
  //wasAnySet will come back false if no input element was red bordered
  //returns true to show validator has validated required inputs
  return !wasAnySet;
};
