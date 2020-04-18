import View from "../View";
import * as ejs from "../ejs.min.js";
import loader from "../templates/loader";

/*
@param elements is an array of unique element identifiers
injects loader as the html content of the element
*/
export default (elements) => {
  if (!Array.isArray(elements))
    throw Error("INJECTLOADER: elements parameter should be an array");
  elements.forEach((item) =>
    View.addContent(`#${item}`, ejs.render(loader), true)
  );
  return;
};
