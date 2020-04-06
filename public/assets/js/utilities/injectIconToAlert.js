import { infoIcon, dangerIcon, successIcon } from "../templates/icons";
// import * as ejs from "../ejs.min.js";
import View from "../View";

export default element => {
  const context = View.getElement(
    (element && element.parentElement) || document
  );
  const alerts = context.querySelectorAll(".alert");
  for (let alert of alerts) {
    let icon;
    let alertHTML = alert.innerHTML;
    if (alertHTML.toString().includes("iconify")) continue;
    if (alert.classList.contains("alert-info")) icon = infoIcon;
    else if (alert.classList.contains("alert-danger")) icon = dangerIcon;
    else if (alert.classList.contains("alert-success")) icon = successIcon;
    else icon = "";
    icon && (alert.innerHTML = `${icon} ${alertHTML}`);
  }
};
