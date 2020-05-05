import View from "./viewIndex";
import {
  validateForms,
  distributionTabValidator,
  getDistributionTabData,
} from "../lib/addMusicFn";
import Album from "../components/Album";

export default class AddMusicView extends View {
  constructor() {
    super();
    this.STORE_LIST_CONTAINER = this.getElement("#stores-container");
    this.STORE_OPTIONS_CONTAINER = this.getElement("#store-options");
    //Get the stores and selected stores set by the server on the element with ID "store-list"
    const { stores, selected } = this.getElement(
      this.STORE_LIST_CONTAINER
    ).dataset;
    this.stores = JSON.parse(stores);
    this.selectedStores = JSON.parse(selected);

    ////
    const { release_type, release_id, release_status } = this.getElement(
      "#add-music"
    ).dataset;
    this.RELEASE_TYPE = release_type;
    this.RELEASE_ID = Number(release_id);
    this.RELEASE_STATUS = release_status;
    this.RELEASE_PANE_ID = "#release-info";
    this.TRACK_PANE_ID = "#track-info";
    this.SCHEDULE_PANE_ID = "#schedule-info";
    this.DESTRIBUTION_PANE_ID = "#distribution-info";
    this.TRACK_PRICING_NODE = this.getElement("#track-pricing");
    this.STORE_OPTIONS_NODE = this.getElement("#store-options");
    this.STORES_CONTAINER = this.getElement("#stores-container");
    this.PUBLISH_BUTTON = this.getElement("#addMusic-publish");
    this.SAVE_BUTTON = this.getElement("#addMusic-save");
    this.ALBUMTRACKSCONTAINER = this.getElement("#album-track-list-container");
    //
    this.albumFn = Album(this.ALBUMTRACKSCONTAINER);
  }

  convertStoresArrayToHash(stores) {
    return stores.reduce((prev, curr) => ({ ...prev, [curr.id]: curr }), {});
  }

  initiateStores() {
    this.processStores(this.selectedStores);
    return this;
  }

  processStores(selectedStores = []) {
    const toBeCheckedHash = this.convertStoresArrayToHash(selectedStores);
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

  bindToStoreList() {
    this.STORE_LIST_CONTAINER.addEventListener("change", (e) => {
      e.stopPropagation();
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
      e.stopPropagation();
      const { type } = e.target.dataset;
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
    const releaseTabFormData = this.getFormData(releaseTabForm, true);

    //TRACK TAB
    let trackData;
    if (this.RELEASE_TYPE === "track") {
      const singleTrackForm = this.getElement("form", this.TRACK_PANE_ID);
      trackData = [this.getFormData(singleTrackForm, true)];
    } else {
      trackData = await this.albumFn.getAlbumTracksData();
    }

    //SCHEDULE TAB
    const scheduleTabForm = this.getElement("form", this.SCHEDULE_PANE_ID);
    const scheduleTabFormData = this.getFormData(scheduleTabForm);

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
      ...releaseTabFormData,
      ...scheduleTabFormData,
      ...distributionTabFormData,
    };
    return { releaseData, trackData, checkedStores };
  }

  bindPublishRelease(handler) {
    this.showLoader(true);
    const _getTabIdNode = (paneId) => this.getElement(`a[href="${paneId}"]`);
    const _getPaneNode = (paneId) => this.getElement(paneId);
    this.PUBLISH_BUTTON.addEventListener("click", async (e) => {
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
          _getPaneNode(this.RELEASE_PANE_ID),
          _getTabIdNode(this.RELEASE_PANE_ID)
        );
      } else {
        const tracksNotValidated = this.albumFn.tracksNotValidated();
        trackTabStatus = true;
        if (tracksNotValidated) {
          if (typeof tracksNotValidated === "string")
            this.showAlert(tracksNotValidated);
          trackTabStatus = false;
        }
      }
      const trackPricingsNode = this.getElement("#track-pricing");
      const storeOptionsNode = this.getElement("#store-options");
      const distributionTabStatus = distributionTabValidator(
        null,
        this.DESTRIBUTION_PANE_ID,
        [trackPricingsNode, storeOptionsNode]
      );
      if (
        releaseTabStatus &&
        trackTabStatus &&
        scheduleTabStatus &&
        distributionTabStatus
      ) {
        const data = await this._getReleaseData();
        const response = await handler(data);
        console.log("PUBLISH: ", response);
        this.showLoader(false);
      } else {
        this.showLoader(false);
      }
    });
  }

  bindSaveRelease(handler) {
    this.SAVE_BUTTON.addEventListener("click", async (e) => {
      e.stopPropagation();
      console.log("CLICKED");
      const data = await this._getReleaseData();
      // const response = await handler(data);
      console.log("SAVE: ", data);
      const response = await handler(data);
      console.log("BIND SAVE: ", response);
      this.showLoader(false);
    });
  }
}
