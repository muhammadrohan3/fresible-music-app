import flatpickr from "flatpickr";
import Event from "../Events/admin";
import Controller from "../Controllers/admin";
import injectIconToAlert from "../components/AlertIcon";
import "popper.js";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/tab";
import "bootstrap/js/dist/dropdown";
import "bootstrap-table/dist/bootstrap-table";
import "bootstrap-table/dist/extensions/mobile/bootstrap-table-mobile";

(() => {
  Event(Controller());
  flatpickr("input[type=date]", {
    maxDate: new Date(Date.now()),
  });
  injectIconToAlert();
})();
