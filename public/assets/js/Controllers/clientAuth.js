// import "core-js/stable";
// import "regenerator-runtime/runtime";
import formSubmit from "../utilities/submitForm";
import view from "../View";
// import { async } from "regenerator-runtime/runtime";

export default () => {
  const Data = {
    components: {
      signup: ["Sign Up", "signup"],
      signin: ["Sign In", "signin"],
      forgotPassword: ["Forgot Password", "forgotPassword"],
      passwordReset: ["Password Reset", "passwordReset"],
      passwordChanged: ["Password Changed", "passwordChanged"],
      verifySuccess: ["Account Verfied", "verified"]
    },
    activeComp: "#signin",
    slidesLength: 0,
    currentComp: "",
    baseUrl: `${window.location.origin}/auth`
  };

  const View = Object.create(view);
  View.showAlert = function(text) {
    this.showLoader(false);
    return text;
  };

  const submitForm = formSubmit(View);

  const renderFormNotification = (text, elemId) => {
    const formNotif = View.getElement(`${elemId} div.form--notification`);
    View.addContent(formNotif, text, true);
    View.show(formNotif);
    let nextElement = View.getElement(formNotif).nextElementSibling;
    if ($(nextElement).hasClass("alert")) View.hide(nextElement);
    return View.showLoader(false);
  };

  const renderComponent = () => {
    const comp = location.hash;
    const docTitle = document.title;
    View.showLoader(false);
    const { components, activeComp } = Data;
    let newComp = comp.substr(1);
    if (comp === activeComp) return;
    if (components[newComp]) {
      View.hide(activeComp);
      View.show(comp);
      Data["activeComp"] = comp;
      let newDocTitle = docTitle.replace(/\w+ \w+/, components[newComp][0]);
      return (document.title = newDocTitle);
    }
    window.location.hash = "#signin";
    return renderComponent();
  };

  const sliderInitiate = items => {
    const slidesLength = items.length;
    let currentSlide = 0;
    setInterval(() => {
      let i = ++currentSlide % slidesLength;
      currentSlide = i == 0 ? 0 : currentSlide;
      let previousSlide = currentSlide - 1 < 0 ? slidesLength : currentSlide;
      View.removeClass(items[previousSlide - 1], "slide-show");
      View.addClass(items[currentSlide], "slide-show");
    }, 3000);
  };

  return {
    renderComponent,
    sliderInitiate,
    handleSignIn: async function(e) {
      View.showLoader(true);
      const { status, data } = await submitForm(e);
      if (status === "success") return View.refresh();
      return data && renderFormNotification(data, "#signin");
    },
    handleSignUp: async function(e) {
      View.showLoader(true);
      const { status, data } = await submitForm(e);
      if (status === "success") return View.refresh();
      return data && renderFormNotification(data, "#signup");
    },
    handleForgotPassword: async e => {
      View.showLoader(true);
      const { data } = await submitForm(e);
      return renderFormNotification(data, "#forgotPassword");
    },
    handleResetPassword: async e => {
      View.showLoader(true);
      const { data, status } = await submitForm(e);
      if (status === "error")
        return renderFormNotification(data, "#passwordReset");
      return (location.hash = "#passwordChanged");
    }
  };
};
