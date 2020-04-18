import Event from "../Events/client";
import Controller from "../Controllers/client";
// import { async } from "regenerator-runtime/runtime";
import injectIconToAlert from "../components/AlertIcon";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/tab";
import "bootstrap-table/dist/bootstrap-table";
import "bootstrap-table/dist/extensions/mobile/bootstrap-table-mobile";
import "../../../../../node_modules/flatpickr/dist/flatpickr.css";
import "../../scss/index.scss";

(() => {
  Event(Controller());
  injectIconToAlert();
  // $("#modal").modal();
})();
