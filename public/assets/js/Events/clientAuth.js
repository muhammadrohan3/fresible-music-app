import View from "../View";

export default Controller => {
  const { getElement } = View;

  if (location.search.substr(1).startsWith("token"))
    location.hash = "#passwordReset";

  document.body.addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    if (form.id === "signin") return Controller.handleSignIn(form);
    if (form.id === "signup") return Controller.handleSignUp(form);
    if (form.id === "forgotPassword")
      return Controller.handleForgotPassword(form);
    if (form.id === "passwordReset")
      return Controller.handleResetPassword(form);
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.hash) window.location.hash = "#signin";
    Controller.renderComponent();
    Controller.sliderInitiate(getElement("#slider").children);
  });

  window.addEventListener("hashchange", () => Controller.renderComponent());
};
