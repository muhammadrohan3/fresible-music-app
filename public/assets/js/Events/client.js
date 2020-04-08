import View from "../View";
import flatpickr from "flatpickr";
import album from "../utilities/album";
import AudioPlayer from "../utilities/audioPlayer";
import processInputIgnore from "../utilities/processInputIgnore";
import injectLoader from "../utilities/injectLoader";
import loadRoyaltiesChart from "../utilities/loadRoyaltiesChart";

export default (Controller) => {
  let E;
  const Album = album(Controller, View);
  if (location.pathname.startsWith("/add-music")) {
    //This opens the bootstrap modal containing informations relevant to the add music page (Maybe I will work on a generic form of notification later)
    //You may as well work on this (GREAT).
    // if (location.pathname === "/add-music/create") $("#modal").modal();
    //Flatpickr date component
    flatpickr("input[type=date]", {
      minDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
    });
    //ALBUM FUNCTIONALITY
    Album.initiate();
  }

  if (location.pathname === "/royalties") {
    injectLoader(["royalties-graph-container"]);
    loadRoyaltiesChart();
  }

  //CHANGE EVENT LISTENER GROUP
  document.body.addEventListener("change", (e) => {
    const {
      id,
      type,
      tagName,
      dataset: { filter_target },
    } = e.target;
    if (id === "hamburger") return Controller.handleMobileMenu(e.target);
    if (filter_target) Controller.handleSelectFilter(e.target);
    if (e.target.classList.contains("form__input--element"))
      processInputIgnore(e.target);
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

    if (id === "addMusic-save") return Controller.handleSaveRelease();

    if (id === "addMusic-publish")
      return Controller.handlePublishRelease(e.target);

    //SELECT ACCOUNT TYPE EVENT LISTENER
    if (id.startsWith("selectAccount-"))
      return Controller.handleSelectAccountType(e.target);

    if (id.startsWith("player-container"))
      return AudioPlayer().handle(e.target);

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
    //This handles add music page forms that are submitted
    if (id === "initiate-release")
      return Controller.handleInitiateRelease(form);

    //ADD-MUSIC TERMS PAGE BUTTON CLICK HANDLER
    if (id === "addMusic-terms")
      return Controller.handleAddMusicTerms(e.target);

    if (id === "artists-add-artist")
      return Controller.handleAddNewArtist(e.target);

    //This holds it up for the Album functions to take over;
    if (
      (E = View.getElement("#addMusic-album-track-list")) &&
      E.contains(e.target)
    )
      return null;

    // SUBMIT EVENT HANDLERS FOR NORMAL PAGES

    return Controller.submitForm(form, { refresh: true });
  });

  // ENDED EVENT HANDLERS
  document.body.addEventListener("ended", (e) => {
    const { id } = e.target;
    if (id.startsWith("player-track")) return AudioPlayer().ended(e.target);
  });
};
