import Event from "../Events/client";
import Controller from "../Controllers/client";
import album from "../utilities/album";
import flatpickr from "flatpickr";
// import { async } from "regenerator-runtime/runtime";
import injectIconToAlert from "../utilities/injectIconToAlert";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/tab";
import "../../../../../node_modules/flatpickr/dist/flatpickr.css";
import "../../scss/index.scss";

(() => {
  Event({ Controller: Controller(), album, flatpickr });
  injectIconToAlert();
  // $("#modal").modal();
})();
