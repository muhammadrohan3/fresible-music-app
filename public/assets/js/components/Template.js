import * as ejs from "../ejs.min.js";
import templates from "../templates/index";

export default (templateName, TemplateData) => {
  const templateRoute = Array.isArray(templateName)
    ? templateName
    : [templateName];
  let template;
  templateRoute.forEach(
    (route) => (template = template ? template[route] : templates[route])
  );
  if (!template) throw new Error("TEMPLATE NOT FOUND");
  return ejs.render(template, { TemplateData });
};
