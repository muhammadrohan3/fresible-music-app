export default View => (form, errors, reset) => {
  let status = false;
  const inputs = form.querySelectorAll(".form__input--element");
  for (let input of inputs) {
    const { name, type } = input;
    if (type === "file") input = input.parentElement;
    let errorLogger = type === "file" ? false : input.nextElementSibling;
    if (errors && name && errors.hasOwnProperty(name)) {
      status = true;
      errorLogger && View.addContent(errorLogger, errors[name]);
      errorLogger && (errorLogger.style.color = "#DC3545");
      View.addClass(input, "-u-border-error");
    } else {
      errorLogger && View.addContent(errorLogger, "");
      View.removeClass(input, "-u-border-error");
    }
  }
  return status;
};
