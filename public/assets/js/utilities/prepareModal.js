import View from "../View";
import "../ejs.min.js";

export default source => (item, data = {}) =>
  source &&
  item &&
  View.addContent("#modal-body", ejs.render(source[item], data), true);
