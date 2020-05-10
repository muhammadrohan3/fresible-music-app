import "regenerator-runtime/runtime";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import injectIconToAlert from "../components/AlertIcon";
import templateComp from "../components/Template";
import pubSub from "../lib/pubSub";

class View {
  constructor() {
    let L; //temporary location variable;
    this.files = {};
    this.MAIN_PAGE = this.getElement("#main-page");
    this.mobileMenuElement = this.getElement("#hamburger");
    this.LOADER_TEXT = this.getElement("#loader-text");

    flatpickr("input[type=date]", {
      minDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
    });

    //SUBSCRIPTIONS
    pubSub.subscribe("loader/loading", this.showLoaderText, this);

    //EVENTS
    //CLICK
    document.body.addEventListener("click", (e) => {
      const { tagName, name, type, id } = e.target;

      //Close the mobile menu if opened when the body is clicked
      if (!this.MAIN_PAGE.classList.contains("-u-close-menu")) {
        this.mobileMenuElement.click();
      }
      if ((L = this.getElement("#checkboxD")) && L.checked) {
        L.click(); //closes the profile pane if open
      }
    });

    //CHANGE
    document.body.addEventListener("change", (e) => {
      const { tagName, name, type, id } = e.target;

      if (id === "hamburger") {
        e.stopPropagation();
        this.handleMobileMenu(e.target);
      }

      if (["INPUT", "SELECT", "TEXTAREA"].includes(tagName)) {
        this.processFormElementChange(e.target);
      }

      if (tagName === "INPUT" && type === "file") {
        this.handleFile(e.target);
      }
    });
  }

  refresh() {
    location.reload();
  }
  replace(href) {
    location.replace(href);
  }

  show(id) {
    this.removeClass(id, "hide");
  }

  hide(id) {
    this.addClass(id, "hide");
  }

  template(templateName, templateData) {
    return templateComp(templateName, templateData);
  }

  removeClass(elem, className) {
    this.getElement(elem) && this.getElement(elem).classList.remove(className);
    return this;
  }

  addClass(elem, className) {
    this.getElement(elem) && this.getElement(elem).classList.add(className);
    return this;
  }

  toggleClass(elem, className) {
    this.getElement(elem) && this.getElement(elem).classList.toggle(className);
  }

  getElement(id, parent) {
    const source =
      parent && typeof parent === "string"
        ? document.querySelector(parent)
        : parent;
    if (source) return source.querySelector(id);
    return typeof id === "string" ? document.querySelector(id) : id;
  }

  showAlert(text, stay = true) {
    if (!text) return this.removeClass("#page-alert", "page__alert--show");
    this.showLoader(false);
    this.addContent("#page-alert-text", text, true);
    this.addClass("#page-alert", "page__alert--show");
    if (stay && Number.isNaN(stay)) stay = 10;
    return setTimeout(
      () => removeClass("#page-alert", "page__alert--show"),
      stay * 1000
    );
  }

  showLoader(status) {
    status && this.showAlert(false);
    return status ? this.show("#loader") : this.hide("#loader");
  }

  showLoaderText(number) {
    this.addContent(this.LOADER_TEXT, number);
    return;
  }

  getCookieValue(cookieName) {
    const cookies = decodeURIComponent(document.cookie);
    let cookieValue = "";
    cookies.split("; ").forEach((cookie) => {
      let [key, value] = cookie.split("=");
      cookieName = cookieName.toLowerCase();
      key = key.toLowerCase();
      if (cookieName === key) cookieValue = value;
    });
    return cookieValue;
  }

  handleMobileMenu(target) {
    this.toggleClass("#main-page", "-u-close-menu");
    return this;
  }

  addHTML(element, html) {
    this.getElement(element).innerHTML = html;
    return this;
  }

  addContent(elem, content) {
    const element = this.getElement(elem);
    element.textContent = content;
    return this;
  }

  elemAttribute(e, attr, value) {
    if (value) this.getElement(e).setAttribute(attr, value);
    else this.getElement(e).getAttribute(attr);
    return this;
  }

  processFormElementChange(input) {
    input.dataset.ignore && input.removeAttribute("data-ignore");
    return this;
  }

  handleFile(e) {
    //Gets the parent container of the input="file" element
    let container = this.getElement(e).parentElement;
    //Gets the label element of the container
    const label = this.getElement("label", container);
    //Gets the preview element
    const preview = this.getElement("div", container);
    //Gets the necessary data from the container
    const { filelimit, filetype, public_id, url, upload_preset } = e.dataset;
    const [file] = e.files;
    if (!file) return;

    //GET THE UPLOADED FILE EXTENSION
    const splittedFileName = file.name.split(".");
    const uploadedFileType = splittedFileName[
      splittedFileName.length - 1
    ].toLowerCase();

    const _nullFileInput = (errorMessage) => {
      //nulls the file and output an error of filesize larger than the limit specified
      this.addContent(preview, errorMessage);
      e.value = null;
      this.addContent(label, `Select ${filetype}`);
    };

    if (
      filetype === "image" &&
      !["jpg", "jpeg", "png"].includes(uploadedFileType)
    )
      return _nullFileInput("Image format not supported");
    // if (
    //   file.type &&
    //   filetype === "audio" &&
    //   !["mp3", "wav", "mpeg"].includes(uploadedFileType)
    // ) {
    //   return _nullFileInput("Audio format not supported");
    // }
    //Comparing the actual file size to the limit set for the file
    if (file.size / 1000000 > filelimit) {
      return _nullFileInput(`File is larger than ${filelimit}mb`);
    }
    //Changes the label to indicate the file was successfully selected
    this.addContent(label, `Change ${filetype}`);
    //Saves the file details to the store
    this.files[e.name] = { options: { public_id, url, upload_preset }, file };
    let html;
    //This conditional block just creates the appropriate preview dependent on the file type
    if (filetype === "image") {
      let imgSrc = URL.createObjectURL(file);
      html = this.template(["addMusic", "imagePreview"], imgSrc);
    } else if (filetype === "audio") {
      let fileName = file.name;
      //This reduces the file name for longer file names to something small
      fileName =
        fileName.length > 15 ? `${fileName.substr(0, 15)}...` : fileName;
      html = this.template(["addMusic", "audioPreview"], fileName);
    }
    //Sends the preview to the View
    this.addHTML(preview, html);
    return this;
  }

  async confirmAction(title, text, buttonText) {
    const result = await Swal.fire({
      title: `${title || "Are you sure?"}`,
      text: `${
        text || "Proceeding with this action will make changes to the system"
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${buttonText || "proceed"}`,
    });
    if (result.value) return true;
    return false;
  }

  getFormData(form, getAll = false) {
    let rawFormData = {};
    let formFiles = [];
    const requiredData = {};
    const { form_select } = form.dataset;
    const formdata = form.dataset.formdata
      ? JSON.parse(form.dataset.formdata)
      : {};
    let target = form_select || ".form__input--element";
    let formInputs = form.querySelectorAll(target);
    try {
      for (let i = 0; i < formInputs.length; i++) {
        const { ignore } = formInputs[i].dataset;
        //checks if form element should be ignored
        if (ignore && !getAll) continue;
        let { name, value, type, required, files } = formInputs[i];
        if (!name) continue;
        if (type === "file" && files[0]) {
          formFiles.push([name]);
          continue;
        }
        if (type === "checkbox")
          rawFormData = { ...rawFormData, [name]: formInputs[i].checked };
        else value && (rawFormData = { ...rawFormData, [name]: value });
        if (required && !value) requiredData[name] = "";
      }
      return { rawFormData, formFiles, formdata, requiredData };
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default View;
