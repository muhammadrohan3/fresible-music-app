export default View => (form, errors, reset) => {
  console.log("FORM ERROR HANDLER: ", form, errors, reset);
  const inputs = form.querySelectorAll("input");
  for (let input of inputs) {
    const { name } = input;
    let errorLogger = input.nextElementSibling;
    if (errors && errors[name]) {
      View.addContent(errorLogger, errors[name]);
      errorLogger.style.color = "#DC3545";
      View.addClass(input, "-u-border-error");
    } else {
      errorLogger && View.addContent(errorLogger, "");
      View.removeClass(input, "-u-border-error");
    }
  }
  return;
};
