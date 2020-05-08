import Event from "../Events/client";
import Controller from "../Controllers/client";
import { AddMusicController } from "../Controller/client/index";
import { AddMusicView } from "../views/client/index";
import ViewIndex from "../views/viewIndex";
// import { async } from "regenerator-runtime/runtime";
import injectIconToAlert from "../components/AlertIcon";
import AudioPlayer from "../components/AudioPlayer";
import "normalize.css";
import "popper.js";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/tab";
import "bootstrap/js/dist/dropdown";
import "bootstrap-table/dist/bootstrap-table";
import "bootstrap-table/dist/extensions/mobile/bootstrap-table-mobile";
import "../../../../../node_modules/flatpickr/dist/flatpickr.css";
import "../../scss/index.scss";
import View from "../View";

(() => {
  injectIconToAlert();
  AudioPlayer().listenForEvents();
  try {
    if (location.pathname.startsWith("/add-music")) {
      new AddMusicController(new AddMusicView());
    } else {
      new ViewIndex();
      Event(Controller());
    }
  } catch (err) {
    console.log(err);
    View.showAlert(err);
  }
})();
