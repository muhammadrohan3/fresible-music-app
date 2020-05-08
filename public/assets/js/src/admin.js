import flatpickr from "flatpickr";
import Event from "../Events/admin";
import Controller from "../Controllers/admin";
import injectIconToAlert from "../components/AlertIcon";
import { ReleaseController } from "../Controller/admin/index";
import { ReleaseView } from "../views/admin/index";
import "popper.js";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/tab";
import "bootstrap/js/dist/dropdown";
import "bootstrap-table/dist/bootstrap-table";
import "bootstrap-table/dist/extensions/mobile/bootstrap-table-mobile";

(() => {
  flatpickr("input[type=date]", {
    maxDate: new Date(Date.now()),
  });
  injectIconToAlert();
  if (location.pathname.startsWith("/fmadmincp/submission/")) {
    return new ReleaseController(new ReleaseView());
  }
  Event(Controller());
})();
