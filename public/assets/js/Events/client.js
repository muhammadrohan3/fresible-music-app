import View from "../View";
import AudioPlayer from "../utilities/audioPlayer";
import processInputIgnore from "../utilities/processInputIgnore";

export default ({ album, Controller, flatpickr }) => {
  const { getElement } = View;
  let t;
  album(Controller, View);
  if (location.pathname.startsWith("/add-music")) {
    //This opens the bootstrap modal containing informations relevant to the add music page (Maybe I will work on a generic form of notification later)
    //You may as well work on this (GREAT).
    // if (location.pathname === "/add-music/create") $("#modal").modal();
    //Flatpickr date component
    flatpickr("input[type=date]", {
      minDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12)
    });
    //ALBUM FUNCTIONALITY
    // album(Controller, View);
  }

  //CHANGE EVENT LISTENER GROUP
  document.body.addEventListener("change", e => {
    const {
      id,
      type,
      tagName,
      dataset: { filter_target }
    } = e.target;

    if (filter_target) Controller.handleSelectFilter(e.target);
    if (["INPUT", "SELECT"].includes(tagName)) processInputIgnore(e.target);
    if (id === "hamburger") return Controller.handleMobileMenu(e.target);
    if (id === "package-select") return Controller.handlePackageSelect(e);
    if (type === "file") return Controller.handleFile(e.target);
  });

  //CLICK EVENT LISTENER GROUP
  getElement("body").addEventListener("click", e => {
    const { id, tagName, dataset } = e.target;
    //HANDLES ACCOUNT VERIFY POPUP ALERT
    if (e.target.classList.contains("page__alert--link"))
      return Controller.sendVerifyRequest();
    //CLOSES ALERT
    if (id === "alert-close") return Controller.closeAlert();
    //SELECT PACKAGE EVENT LISTENER
    if (id === "select-package" && tagName === "BUTTON")
      return Controller.selectPackage(e.target);
    //CONFIRM ACCOUNT EVENT LISTENER
    if (id === "confirm-account") Controller.sendVerifyRequest();
    //PAYMENT PAGE BUTTON HANDLER
    if (id === "payment-button") return Controller.handlePayment(e);
    // PAYMENT QUERY BUTTON HANDLER
    if (id === "queryPayment") return Controller.queryPayment(e.target);

    if (id.startsWith("player-container"))
      return AudioPlayer().handle(e.target);

    if (location.pathname === "/select-package") {
      if (tagName === "BUTTON" && dataset)
        return Controller.selectPackage(e.target);
    }

    //ADD MUSIC EVENT LISTENER
    if (location.pathname.startsWith("/add-music")) {
      //This handles package select event on the add music page
      if (id === "upload-media")
        return Controller.updateMusicSubmission(e.target.parentElement);
      //This handles final release confirmation
      if (id === "submission") return Controller.confirmMusic(e.target);
    }
  });

  //SUBMIT EVENT LISTENER GROUP
  getElement("body").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const { id } = form;
    //This handles add music page forms that are submitted
    if (id === "initiate-release")
      return Controller.handleInitiateRelease(form);

    if (id.startsWith("album-form")) return null;

    // SUBMIT EVENT HANDLERS FOR NORMAL PAGES
    switch (id.toLowerCase()) {
      // case "complete-profile":
      //   return Controller.completeProfile(form);
      default:
        return Controller.submitForm(form, true);
    }
  });

  // ENDED EVENT HANDLERS
  document.body.addEventListener("ended", e => {
    const { id } = e.target;
    if (id.startsWith("player-track")) return AudioPlayer().ended(e.target);
  });
};
