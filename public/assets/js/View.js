import "regenerator-runtime/runtime";
import Swal from "sweetalert2";
import injectIconToAlert from "./components/AlertIcon";

const View = ((document) => {
  const _ = (e) => document.querySelector(e);
  const getCookieValue = (cookieName) => {
    const cookies = decodeURIComponent(document.cookie);
    let cookieValue = "";
    cookies.split("; ").forEach((cookie) => {
      let [key, value] = cookie.split("=");
      cookieName = cookieName.toLowerCase();
      key = key.toLowerCase();
      if (cookieName === key) cookieValue = value;
    });
    return cookieValue;
  };

  const getFormData = (form, getAll = false) => {
    let rawFormData = {};
    let isThereFile = [];
    let isThereDate = [];
    const requiredData = {};
    const { form_select } = form.dataset;
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
          isThereFile.push([name]);
          continue;
        }
        if (type === "checkbox")
          rawFormData = { ...rawFormData, [name]: formInputs[i].checked };
        else value && (rawFormData = { ...rawFormData, [name]: value });
        if (required && !value) requiredData[name] = "";
      }

      return { rawFormData, isThereFile, isThereDate, requiredData };
    } catch (e) {
      throw new Error(e);
    }
  };

  const show = (id) => removeClass(id, "hide");

  const hide = (id) => addClass(id, "hide");

  const removeClass = (elem, className) =>
    getElement(elem) && getElement(elem).classList.remove(className);
  const addClass = (elem, className) =>
    getElement(elem) && getElement(elem).classList.add(className);
  const addContent = (elem, content, isHTML) => {
    const element = getElement(elem);
    element[isHTML ? "innerHTML" : "textContent"] = content;
    isHTML && injectIconToAlert(elem);
  };

  const getElement = (id, parent) => {
    const source = parent && typeof parent === "string" ? _(parent) : parent;
    if (source) return source.querySelector(id);
    return typeof id === "string" ? document.querySelector(id) : id;
  };

  const showAlert = (text, stay) => {
    if (!text) return removeClass("#page-alert", "page__alert--show");
    showLoader(false);
    addContent("#page-alert-text", text, true);
    addClass("#page-alert", "page__alert--show");
    if (stay && Number.isNaN(stay)) return;
    return setTimeout(
      () => removeClass("#page-alert", "page__alert--show"),
      (stay && stay * 1000) || 2500
    );
  };

  const showLoader = (status) => {
    status && showAlert(false);
    return status ? show("#loader") : hide("#loader");
  };

  const elemAttribute = (e, attr, value) =>
    value
      ? getElement(e).setAttribute(attr, value)
      : getElement(e).getAttribute(attr);

  const refresh = () => location.reload();
  const replace = (href) => location.replace(href);

  const confirmAction = async (title, text, buttonText) => {
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
  };

  const prepareModal = async () => {};

  return {
    show,
    hide,
    addClass,
    removeClass,
    getElement,
    getCookieValue,
    showAlert,
    refresh,
    replace,
    loaderText: (text) => addContent("#loader-text", text),
    showLoader,
    getFormData,
    elemAttribute,
    addContent,
    confirmAction,
  };
})(document);

export default View;
