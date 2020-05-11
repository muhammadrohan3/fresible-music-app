import flatpickr from "flatpickr";
import View from "../viewIndex";
import {
  validateForms,
  distributionTabValidator,
  getDistributionTabData,
} from "../../lib/addMusicFn";
import Album from "../../components/Album";

export default class AddMusicView extends View {
  constructor() {
    let L;
    super();
    this.STORE_LIST_CONTAINER = this.getElement("#stores-container");
    this.STORE_OPTIONS_CONTAINER = this.getElement("#store-options");
    //Get the stores and selected stores set by the server on the element with ID "store-list"
    const { stores, selected } =
      ((L = this.getElement(this.STORE_LIST_CONTAINER)) && L.dataset) || {};
    this.stores = stores && JSON.parse(stores);
    this.selectedStores = selected && JSON.parse(selected);

    //TERMS
    this.TERMS_FORM = this.getElement("#terms");

    //INITIATE
    this.INITIATE_RELEASE = this.getElement("#initiate-release");

    ////
    this.ADD_MUSIC_TERMS = this.getElement("#terms");
    this.ADD_MUSIC_INDEX = this.getElement("#add-music");
    const { release_type, release_id, release_status } =
      ((L = this.ADD_MUSIC_INDEX) && L.dataset) || {};
    this.RELEASE_TYPE = release_type;
    this.RELEASE_ID = Number(release_id);
    this.RELEASE_STATUS = release_status;
    this.RELEASE_PANE_ID = "#release-info";
    this.TRACK_PANE_ID = "#track-info";
    this.SCHEDULE_PANE_ID = "#schedule-info";
    this.DESTRIBUTION_PANE_ID = "#distribution-info";
    this.TRACK_PRICING_NODE = this.getElement("#track-pricing");
    this.STORE_OPTIONS_NODE = this.getElement("#store-options");
    this.STORES_PARENT = this.getElement("#stores-parent");
    this.STORES_CONTAINER = this.getElement("#stores-container");
    this.PUBLISH_BUTTON = this.getElement("#addMusic-publish");
    this.SAVE_BUTTON = this.getElement("#addMusic-save");
    this.ADD_NEW_TRACK_BTN = this.getElement("#add-new");
    this.ALBUMTRACKSCONTAINER = this.getElement("#addMusic-album-track-list");

    //
    this.albumFn = null;

    flatpickr("input[type=date]", {
      minDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    });
  }

  bindTermsForm() {
    this.TERMS_FORM.addEventListener("submit", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const checkBoxes = e.target.querySelectorAll("input");
      for (const checkBox of checkBoxes) {
        if (!checkBox.checked)
          return this.showAlert("Please agree to all terms and conditions.");
      }
      return this.replace("/add-music/create");
    });
  }

  bindAlbumUI() {
    this.albumFn = Album(this.ALBUMTRACKSCONTAINER, this.ADD_NEW_TRACK_BTN);
    this.albumFn.initiate();
  }

  bindInitiateSelectAction(handler) {
    this.INITIATE_RELEASE.addEventListener("change", async (e) => {
      e.stopPropagation();
      const { name, value, dataset } = e.target;
      const { filter_name, filter_target } = dataset;
      if (!filter_name || !filter_target) return;
      this.showLoader(true);
      const data = await handler(filter_name, { [name]: value });
      const targetSelectElem = this.getElement(filter_target);
      this.addHTML(targetSelectElem, this.template(["options"], data));
      targetSelectElem.disabled = false;
      this.showLoader(false);
    });
  }

  bindInitiateSubmit(handler) {
    this.INITIATE_RELEASE.addEventListener("submit", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { rawFormData } = this.getFormData(e.target, true);
      this.showLoader(true);
      const data = await handler(rawFormData);
      this.replace(`/add-music/${data.id}`);
    });
  }

  initiateStores() {
    const stores = this.selectedStores.length
      ? this.selectedStores
      : this.stores;
    this.processStores(stores);
    return this;
  }

  processStores(selectedStores = []) {
    const toBeCheckedHash = selectedStores.reduce(
      (prev, curr) => ({ ...prev, [curr.id]: curr }),
      {}
    );
    const toBeCheckedStores = this.stores.map((store) => {
      return toBeCheckedHash[store.id] ? { ...store, checked: true } : store;
    });
    this.renderStoresUI(toBeCheckedStores);
    return this;
  }

  renderStoresUI(stores = []) {
    this.addHTML(
      this.STORE_LIST_CONTAINER,
      this.template(["addMusic", "stores"], stores)
    );
    return this;
  }

  bindDidStoreSelectionChange() {
    this.STORES_PARENT.addEventListener("change", (e) => {
      e.stopPropagation();
      if (e.target.tagName === "INPUT") {
        console.log("DIDSTORECHANGED: CHANGED");
        this.STORES_CONTAINER.setAttribute("data-changed", "true");
      }
    });
  }

  bindToStoreList() {
    this.STORE_LIST_CONTAINER.addEventListener("change", (e) => {
      const customSelect = this.getElement(
        "input[data-type='custom']",
        this.STORE_OPTIONS_CONTAINER
      );
      customSelect.checked = true;
    });
    return this;
  }

  bindToStoreOptions() {
    this.STORE_OPTIONS_CONTAINER.addEventListener("change", (e) => {
      const { type } = e.target.dataset;
      console.log("CHANGE: ", type);
      if (type === "all") {
        this.processStores(this.stores);
      } else if (type === "stream") {
        const streamOnlyStores = this.stores.filter(
          ({ type }) => type === "stream"
        );
        this.processStores(streamOnlyStores);
      } else if (type === "download") {
        const downloadOnlyStores = this.stores.filter(
          ({ type }) => type === "download"
        );
        this.processStores(downloadOnlyStores);
      }
      return this;
    });
  }

  async _getReleaseData() {
    const releaseTabForm = this.getElement("form", this.RELEASE_PANE_ID);
    const releaseTabFormData = this.getFormData(releaseTabForm);

    //TRACK TAB
    let trackData;
    if (this.RELEASE_TYPE === "track") {
      const singleTrackForm = this.getElement("form", this.TRACK_PANE_ID);
      trackData = this.getFormData(singleTrackForm);
    } else {
      trackData = await this.albumFn.getAlbumTracksData();
    }

    //SCHEDULE TAB
    const scheduleTabForm = this.getElement("form", this.SCHEDULE_PANE_ID);
    const { rawFormData: scheduleTabFormData } = this.getFormData(
      scheduleTabForm
    );

    //DISTRIBUTION TAB
    const {
      releaseInfo: distributionTabFormData,
      checkedStores,
    } = getDistributionTabData(
      this.TRACK_PRICING_NODE,
      this.STORE_OPTIONS_NODE,
      this.STORES_CONTAINER,
      this.RELEASE_ID
    );

    const releaseData = {
      rawFormData: {
        ...releaseTabFormData.rawFormData,
        ...scheduleTabFormData,
        ...distributionTabFormData,
      },
      formFiles: [...releaseTabFormData.formFiles],
    };
    return { releaseData, trackData, checkedStores };
  }

  bindPublishRelease(saveHandler, publishHandler) {
    const _getTabIdNode = (paneId) => this.getElement(`a[href="${paneId}"]`);
    const _getPaneNode = (paneId) => this.getElement(paneId);
    this.PUBLISH_BUTTON.addEventListener("click", async (e) => {
      e.stopPropagation();
      this.showLoader(true);
      const releaseTabStatus = validateForms(
        _getPaneNode(this.RELEASE_PANE_ID),
        _getTabIdNode(this.RELEASE_PANE_ID)
      );
      const scheduleTabStatus = validateForms(
        _getPaneNode(this.SCHEDULE_PANE_ID),
        _getTabIdNode(this.SCHEDULE_PANE_ID)
      );

      let trackTabStatus;
      if (this.RELEASE_TYPE === "track") {
        trackTabStatus = validateForms(
          _getPaneNode(this.TRACK_PANE_ID),
          _getTabIdNode(this.TRACK_PANE_ID)
        );
      } else {
        const tracksNotValidated = this.albumFn.tracksNotValidated();
        trackTabStatus = true;
        _getTabIdNode(this.TRACK_PANE_ID).classList.remove("-u-border-error");
        if (tracksNotValidated) {
          if (typeof tracksNotValidated === "string")
            this.showAlert(tracksNotValidated);
          _getTabIdNode(this.TRACK_PANE_ID).classList.add("-u-border-error");
          trackTabStatus = false;
        }
      }
      const trackPricingsNode = this.getElement("#track-pricing");
      const storeOptionsNode = this.getElement("#store-options");
      const distributionTabStatus = distributionTabValidator(
        null,
        _getPaneNode(this.DESTRIBUTION_PANE_ID),
        [trackPricingsNode, storeOptionsNode]
      );
      if (
        releaseTabStatus &&
        trackTabStatus &&
        scheduleTabStatus &&
        distributionTabStatus
      ) {
        const data = await this._getReleaseData();
        const saveResponse = await saveHandler(
          data,
          this.RELEASE_TYPE,
          this.RELEASE_ID
        );
        if (!saveResponse) {
          return this.showAlert("Error: something went wrong try again");
        }
        const publishResponse = await publishHandler(this.RELEASE_ID);
        this.replace(`/submission/${publishResponse.id}`);
      } else {
        this.showAlert("Some input fields require information from you", 8);
      }
    });
  }

  bindSaveRelease(handler) {
    this.SAVE_BUTTON.addEventListener("click", async (e) => {
      e.stopPropagation();
      this.showLoader(true);
      const data = await this._getReleaseData();
      console.log("SAVE: ", data);
      const response = await handler(data, this.RELEASE_TYPE, this.RELEASE_ID);
      if (!response) {
        return this.showAlert("Error: something went wrong try again");
      }
      return this.refresh();
    });
  }
}
