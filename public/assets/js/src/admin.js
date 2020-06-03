import flatpickr from "flatpickr";
import Event from "../Events/admin";
import Controller from "../Controllers/admin";
import injectIconToAlert from "../components/AlertIcon";
import {
  ReleaseController,
  RoyaltiesController,
} from "../Controller/admin/index";
import { ReleaseView, RoyaltiesView } from "../views/admin/index";
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
  if (location.pathname.startsWith("/fmadmincp/royalties")) {
    return new RoyaltiesController(new RoyaltiesView());
  }
  Event(Controller());
})();
