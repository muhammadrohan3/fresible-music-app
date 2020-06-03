import View from "../View";
import "../ejs.min.js";
import AdminPopups from "../popups/admin/index";
import ClientPopups from "../popups/client/index";

export default class Modal {
  constructor(source) {
    this.source = source;
    this.modalId = "#modal";
  }
  admin() {
    this.source = "admin";
    return this;
  }
  client() {
    this.source = "client";
    return this;
  }
  prepare(template, TemplateData = {}) {
    let source = this.source === "client" ? ClientPopups : AdminPopups;
    View.addContent(
      "#modal-body",
      ejs.render(source[template], { TemplateData }),
      true
    );
    return this;
  }

  title(title = "") {
    $("modal-title").text(title);
    return this;
  }

  launch() {
    $(this.modalId).modal("show");
    return this;
  }

  close() {
    $(this.modalId).modal("hide");
    return this;
  }
}

export const modal = new Modal();
