import View from "../View";
import flatpickr from "flatpickr";
import AudioPlayer from "../components/AudioPlayer";
import processInputIgnore from "../utilities/processFormElementChange";
import injectLoader from "../components/Loader";
import Royalty from "../components/Royalty";
import Analytics from "../components/Analytics";

export default (Controller) => {
  if (location.pathname === "/analytics") {
    (async () =>
      await Analytics.initiate({
        top: { topBoxesBaseLink: "/analytics/get" },
        bodyLink: "/analytics/get",
      }))();
  }

  //CHANGE EVENT LISTENER GROUP
  document.body.addEventListener("change", (e) => {
    const { id, type, tagName } = e.target;
    if (type === "file") return Controller.handleFile(e.target);
  });

  //CLICK EVENT LISTENER GROUP
  document.body.addEventListener("click", (e) => {
    const { id, tagName, dataset } = e.target;
    //HANDLES ACCOUNT VERIFY POPUP ALERT
    if (e.target.classList.contains("page__alert--link"))
      return Controller.sendVerifyRequest();
    //CLOSES ALERT
    if (id === "alert-close") return Controller.closeAlert();
    //CONFIRM ACCOUNT EVENT LISTENER
    if (id === "confirm-account") Controller.sendVerifyRequest();
    //PAYMENT PAGE BUTTON HANDLER
    if (id === "payment-button") return Controller.handlePayment(e);
    // PAYMENT QUERY BUTTON HANDLER
    if (id === "queryPayment") return Controller.queryPayment(e.target);

    //SELECT ACCOUNT TYPE EVENT LISTENER
    if (id.startsWith("selectAccount-"))
      return Controller.handleSelectAccountType(e.target);

    //SELECT PACKAGE EVENT LISTENER
    if (location.pathname === "/select-package") {
      if (tagName === "BUTTON" && e.target.classList.contains("package__btn"))
        return Controller.selectPackage(e.target);
    }
  });

  //SUBMIT EVENT LISTENER GROUP
  document.body.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const { id } = form;

    if (id === "artists-add-artist")
      return Controller.handleAddNewArtist(e.target);

    // SUBMIT EVENT HANDLERS FOR NORMAL PAGES

    return Controller.submitForm(form, { refresh: true });
  });

  // ENDED EVENT HANDLERS
  document.body.addEventListener("ended", (e) => {
    const { id } = e.target;
  });
};
