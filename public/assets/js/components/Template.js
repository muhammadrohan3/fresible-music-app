import * as ejs from "../ejs.min.js";
import View from "../View";
import templates from "../templates/index";

export default (templateName, TemplateData) => {
  const template = templates[templateName];
  if (!template) throw new Error("TEMPLATE NOT FOUND");
  return ejs.render(template, { TemplateData });
};
