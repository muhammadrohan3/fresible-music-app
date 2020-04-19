import formErrorHandler from "./formErrorHandler";
import View from "../View";
import Validations from "../Validations";

export default (form, data, validationName) => {
  if (!data) {
    const { rawFormData = {}, requiredData = {} } = View.getFormData(form);
    data = { requiredData, rawFormData };
  }
  let validationResponse = {};
  if (validationName) {
    let validationFn = Validations[validationName];
    validationFn && (validationResponse = validationFn(data.rawFormData));
  }
  let errors = { ...data.requiredData, ...validationResponse };
  const wasAnySet = formErrorHandler(View)(form, errors);
  //wasAnySet will come back false if no input element was red bordered
  //returns true to show validator has validated required inputs
  return !wasAnySet;
};
