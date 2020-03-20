import flatpickr from "flatpickr";
import Event from "../Events/admin";
import Controller from "../Controllers/admin";
import injectIconToAlert from "../utilities/injectIconToAlert";
import "bootstrap/js/dist/modal";

(() => {
  Event(Controller());
  flatpickr("input[type=date]", {
    maxDate: new Date(Date.now())
  });
  injectIconToAlert();
})();
