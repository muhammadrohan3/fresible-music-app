import * as ejs from "../ejs.min.js";
import templates from "../templates/index";

export default (templateName, TemplateData) => {
  const templateRoute = Array.isArray(templateName)
    ? templateName
    : [templateName];
  let template = templates;
  templateRoute.forEach((route) => {
    Object.entries(template).forEach(([key, value]) => {
      if (key.toLowerCase() === route.toLowerCase()) template = value;
    });
  });
  if (!template) throw new Error("TEMPLATE NOT FOUND");
  return ejs.render(template, { TemplateData });
};
