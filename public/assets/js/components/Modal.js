import View from "../View";
import "../ejs.min.js";
import AdminPopups from "../popups/admin/index";
import ClientPopups from "../popups/client/index";

export default class Modal {
  constructor(source) {
    this.source = source;
    this.modalId = "#modal";
  }
  prepare(template, data = {}) {
    this.template = template;
    this.data = data;
    let source = this.source === "client" ? ClientPopups : AdminPopups;
    View.addContent("#modal-body", ejs.render(source[template], { data }));
    return this;
  }

  launch() {
    $(this.modalId).modal();
    return;
  }
}
