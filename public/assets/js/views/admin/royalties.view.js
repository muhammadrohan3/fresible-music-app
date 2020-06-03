import Swal from "sweetalert2";
import ViewIndex from "../viewIndex";
import Modal from "../../components/Modal";
import DateUI from "../../components/Date";
import Royalty from "../../components/Royalty";

export default class RoyaltiesView extends ViewIndex {
  constructor() {
    super();
    this.ROYALTIES_EDIT_PAGE_ID = "#royaltiesEdit";
    this.ROYALTIES_EDIT_PAGE = Boolean(
      this.getElement(this.ROYALTIES_EDIT_PAGE_ID)
    );
    this.ROYALTIES_STATUS = "processing";
    this.SAVE_BTN = this.getElement("#save");
    this.PUBLISH_BTN = this.getElement("#publish");
    this.modal = new Modal("admin");
    this.STORES = [];
    this.RELEASES = [];
    this.COUNTRIES = [];
    this.DISPLAYED_ROYALTIES = [];
    this.MONTH_ID = null;
    this.modalData = null;

    //
    this.NEW_DATASHEET_BTN = this.getElement("#new-datasheet-btn");
    this.NEW_DATASHEET_INPUT = this.getElement("#new-datasheet-input");
  }

  bindRoyaltiesComponent() {
    Royalty("/fmadmincp/royalties/index/data").initiate();
  }

  async bindNewDataSheetBtn(getAllMonths, createNewMonth) {
    this.NEW_DATASHEET_BTN.addEventListener("click", (e) => {
      e.stopPropagation();
      this._handleNewDataSheet(getAllMonths, createNewMonth);
    });
  }

  async bindGetRoyaltiesDataFromServer(
    getStoresReleasesCountries,
    getMonthRoyaltiesData
  ) {
    const { id, status } = JSON.parse(
      this.getElement(this.ROYALTIES_EDIT_PAGE_ID).dataset.month_data
    );
    this.ROYALTIES_STATUS = status;
    this.MONTH_ID = Number(id);
    const { stores, releases, countries } = await getStoresReleasesCountries();
    const monthRoyalties = await getMonthRoyaltiesData(this.MONTH_ID);
    this.STORES = stores;
    this.RELEASES = releases;
    this.COUNTRIES = countries;
    this._renderRoyalties(monthRoyalties, "#accordion", "release");
    this.DISPLAYED_ROYALTIES = monthRoyalties;
  }

  bindListenForModalFormSubmissions() {
    document.body.addEventListener("submit", (e) => {
      const isNotModalForm = e.target.id !== "royalties-collection";
      if (isNotModalForm) return false;
      e.stopPropagation();
      e.preventDefault();
      return this._handleModalFormSubmissions(e.target);
    });
  }

  bindRoyaltiesEditPageButtonActions() {
    document.body.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return false;
      e.stopPropagation();
      const { action, action_data } = e.target.dataset;
      const actionData = action_data ? JSON.parse(action_data) : {};
      switch (action) {
        case "new-release":
          return this._handleNewEditOptions(actionData, {
            type: "release",
            title: "Select Releases",
            index: 0,
          });
        case "new-country":
          return this._handleNewEditOptions(actionData, {
            type: "country",
            title: "Select Countries",
            index: 1,
          });
        case "new-store":
          return this._handleNewEditOptions(actionData, {
            type: "store",
            title: "Select Stores",
            index: 2,
          });
        case "delete-release":
          return this._handleDelete("release", actionData);
        case "delete-country":
          return this._handleDelete("country", actionData);
        case "delete-store":
          return this._handleDelete("store", actionData);
      }
    });
  }

  bindSaveMonthRoyaltiesDatasheet(handler) {
    this.SAVE_BTN.addEventListener("click", (e) => {
      e.stopPropagation();
      this._handleSaveMonthRoyaltiesDatasheet(handler);
    });
  }

  bindPublishMonthRoyaltiesDatasheet(handler) {
    this.PUBLISH_BTN.addEventListener("click", (e) => {
      e.stopPropagation();
      this._handlePublishMonthRoyaltiesDatasheet(handler);
    });
  }

  async _handleNewDataSheet(searchMonth, createNewMonth) {
    const dateUI = new DateUI();
    const config = {
      clickOpens: false,
      onChange: this._handleGetSelectedMonth(createNewMonth, searchMonth),
    };
    return dateUI
      .config(config)
      .monthYear()
      .render(this.NEW_DATASHEET_INPUT)
      .toggle();
  }

  _handleGetSelectedMonth(createNewMonth, searchMonth) {
    return async (selectedMonths, value) => {
      let [monthValue, yearValue] = value.split(".");
      yearValue = `20${yearValue}`;
      const data = { monthValue, yearValue };
      const foundMonth = await searchMonth(data);
      if (foundMonth) {
        return this.showAlert("Month for the selected year already exists");
      }
      const { id } = await createNewMonth(data);
      return this.replace(`/fmadmincp/royalties/${id}/edit`);
    };
  }

  async _handleSaveMonthRoyaltiesDatasheet(handleSave) {
    const toSubmit = this._processRoyaltiesFormData();
    await handleSave(toSubmit, this.MONTH_ID);
    return this.refresh();
  }

  async _handlePublishMonthRoyaltiesDatasheet(handlePublish) {
    const toSubmit = this._processRoyaltiesFormData();
    await handlePublish(toSubmit, this.MONTH_ID);
    return this.replace("/fmadmincp/royalties");
  }

  _processRoyaltiesFormData() {
    const dataToBeSubmitted = [];
    const monthId = this.MONTH_ID;
    this.DISPLAYED_ROYALTIES.forEach(
      ({ id: releaseId, userId, children: tracks }) => {
        const { elementId } = this._getEntityTypeData("release", { releaseId });
        const $releaseContainer = this.getElement(elementId);
        const $releaseContainerForm = this.getElement(
          "form",
          $releaseContainer
        );
        const { rawFormData: releaseInputs } = this.getFormData(
          $releaseContainerForm
        );
        tracks.forEach(({ id: trackId, children: countries }) => {
          countries.forEach(({ id: countryId, children: stores }) => {
            stores.forEach(({ id: storeId }) => {
              const { elementId } = this._getEntityTypeData("store", {
                releaseId,
                trackId,
                countryId,
                storeId,
              });
              const $storeContainer = this.getElement(elementId);
              const { rawFormData } = this.getFormData($storeContainer);
              dataToBeSubmitted.push({
                userId,
                releaseId,
                trackId,
                countryId,
                storeId,
                monthId,
                ...releaseInputs,
                ...rawFormData,
              });
            });
          });
        });
      }
    );
    return dataToBeSubmitted;
  }

  _getTypeDataForNextModal(type) {
    const { title, items } = this._getEntityTypeData(type);
    return {
      title,
      items: items(),
      selectedItems: {},
    };
  }

  _getSelectedOptionsFromForm(form) {
    return Array.from(form.querySelectorAll("input"))
      .filter(({ checked, disabled }) => checked && !disabled)
      .map(({ value }) => value);
  }

  async _handleModalFormSubmissions(form) {
    const flow = ["release", "country", "store"];
    const { init } = this.modalData;
    const currentFlow = flow[init["index"]];
    const selected = this._getSelectedOptionsFromForm(form);
    const noSelectedItems = !Boolean(selected.length);
    if (noSelectedItems) return this.modal.close();
    this.modalData.selected[currentFlow] = selected;
    const nextFlow = flow[init.index + 1];
    console.log("SELECTED: ", selected, this.modalData, currentFlow, nextFlow);
    if (nextFlow) {
      init.index++; //increase the index to the next
      const toShowModalData = this._getTypeDataForNextModal(nextFlow);
      return this._launchDataCollectionModal(toShowModalData);
    }
    this.modal.close();
    this.showAlert("SHOULD BE CLOSED");
    await this._processModalFlowSubmissions();
  }

  _findById(source = [], searchId) {
    return source.find(({ id }) => id === Number(searchId));
  }

  _findIndexById(source, searchId) {
    return source.findIndex(({ id }) => id === Number(searchId));
  }

  _updateAddMutationsInStore(data = [], routeIds = []) {
    let temp = this.DISPLAYED_ROYALTIES;
    routeIds.forEach((routeId) => {
      const routeIdDataIndex = this._findIndexById(temp, routeId);
      temp = temp[routeIdDataIndex].children;
    });

    data.forEach((currentData) => temp.push(currentData));
  }

  async _processModalFlowSubmissions() {
    const {
      ids,
      selected,
      init: { type },
    } = this.modalData;
    const { containerId, templateName, handler } = this._getEntityTypeData(
      type,
      ids
    );
    let dataStructureToBeRendered = await handler(selected);
    // const data = Array.is
    return this._renderRoyalties(
      dataStructureToBeRendered,
      containerId,
      templateName
    );
  }

  async _generateHTML_injectToDOM(royalty, containerId, templateName) {
    const generatedHTML = this.template(["royalties", templateName], royalty);
    this.getElement(containerId).insertAdjacentHTML("beforeend", generatedHTML);
  }

  async _renderRoyalties(royalties, containerId, templateName) {
    this.showLoader(true);
    await new Promise((resolve) => {
      setTimeout(async () => {
        if (Array.isArray(royalties)) {
          await this._renderRoyalties__handleArray(
            royalties,
            containerId,
            templateName
          );
        } else {
          await this._generateHTML_injectToDOM(
            royalties,
            containerId,
            templateName
          );
        }
        resolve(true);
      }, 200);
    });
    this._refreshTablesUI(containerId);
    this.showLoader(false);
  }
  async _renderRoyalties__handleArray(royalties, containerId, templateName) {
    for (let royalty of royalties) {
      await this._generateHTML_injectToDOM(
        [royalty],
        containerId,
        templateName
      );
    }
    return true;
  }

  _refreshTablesUI(containerId) {
    document.querySelectorAll(`${containerId} table`).forEach(($table) => {
      $($table).bootstrapTable();
    });
  }

  _createIDHashForModalFlow(items = []) {
    return items.reduce((prev, { id }) => ({ ...prev, [id]: 1 }), {});
  }

  _getTraversedValueForIds(source, ids) {
    //traverse through the array of objects using the ids ['releaseId', 'trackId' ...]
    for (let searchId of ids) {
      const foundItemIndex = this._findIndexById(source, searchId);
      source = source[foundItemIndex].children;
    }
    return source;
  }

  _handleNewEditOptions(actionData = {}, initData) {
    const ids = Object.values(actionData);
    this.modalData = {
      init: initData,
      ids: actionData,
      selected: {},
    };
    const entityType = initData["type"];
    const { items } = this._getEntityTypeData(entityType);

    //gets traversed value from this.DISPLAY_ROYALTIES with the ids ==> ['releaseId' ...]
    const dataList = this._getTraversedValueForIds(
      this.DISPLAYED_ROYALTIES,
      ids
    );

    const hashedDataList = this._createIDHashForModalFlow(dataList);

    // console.log(
    //   "NEW ADD ACTION: ",
    //   actionData,
    //   initData,
    // );

    return this._launchDataCollectionModal({
      title: initData.title,
      items: items(),
      selectedItems: hashedDataList,
    });
  }

  _launchDataCollectionModal({ title, items, selectedItems }) {
    this.modal
      .prepare("royaltiesSelection", { items, selectedItems })
      .title(title)
      .launch();
    console.log("LAUNCHED MODAL: ", title);
  }

  _handleDelete(type, actionData) {
    const { containerId, elementId } = this._getEntityTypeData(
      type,
      actionData
    );
    const $container = this.getElement(containerId);
    const $element = this.getElement(elementId, $container);
    console.log($container, $element, containerId, elementId);
    const containerHasOneChild = $container.children.length === 1;
    if (containerHasOneChild) {
      return this.showAlert(`There should be atleast a ${type}`);
    }
    this._removeDeletedItemsFromMemory(actionData);
    //deletes child element node from parent
    $container.removeChild($element);
  }

  _removeDeletedItemsFromMemory({ releaseId, trackId, countryId, storeId }) {
    let currentItemData = this.DISPLAYED_ROYALTIES;
    const pathToRemovedItemIds = [releaseId, trackId, countryId, storeId];
    const filteredPath = pathToRemovedItemIds.filter((item) => Boolean(item));
    filteredPath.forEach((currentId, index) => {
      const isLastItem = index === filteredPath.length - 1;
      const currentItemDataIndex = this._findIndexById(
        currentItemData,
        currentId
      );
      if (isLastItem) {
        //removes the item from the list
        currentItemData.splice(currentItemDataIndex, 1);
      } else {
        currentItemData = currentItemData[currentItemDataIndex].children;
      }
    });
  }

  _generateDataStructure(data = [{ source: this.COUNTRIES, ids: [] }]) {
    if (!data.length) return;
    const _traverser = (index) => {
      const isNotLastItem = index < data.length - 1;
      const item = data[index];
      const { source, ids = [] } = item;
      const idValues = ids.map((id) => {
        const idItem = this._findById(source, id);
        isNotLastItem && (idItem.children = _traverser(index + 1));
        return idItem;
      });
      return idValues;
    };

    return _traverser(0);
  }

  _generateIdAndTitleObjList(source, titleKey = "title") {
    return source.map((data) => ({ id: data.id, title: data[titleKey] }));
  }
  _getEntityTypeData(type, entityData = {}) {
    const { releaseId, trackId, countryId, storeId } = entityData;
    const containers = {
      release: {
        title: "Select Releases",
        items: () => this._generateIdAndTitleObjList(this.RELEASES),
        containerId: "#accordion",
        elementId: releaseId && `#releaseTabItem${releaseId}`,
        templateName: "release",
        source: this.RELEASES,
        handler: async ({
          release: releaseIds,
          country: countryIds,
          store: storeIds,
        }) => {
          const releases = releaseIds.map((releaseId) => {
            const release = this._findById(this.RELEASES, releaseId);
            const tracks = release.tracks.map((track) => {
              track.children = this._generateDataStructure([
                { source: this.COUNTRIES, ids: countryIds },
                { source: this.STORES, ids: storeIds },
              ]);
              return track;
            });
            delete release.tracks;
            release.children = tracks;
            return release;
          });
          this._updateAddMutationsInStore(releases);
          return releases;
        },
      },
      country: {
        title: "Select Countries",
        items: () => this._generateIdAndTitleObjList(this.COUNTRIES, "name"),
        containerId: `#releaseTrackSubContainer${releaseId}-${trackId}`,
        templateName: "country",
        elementId:
          countryId &&
          `#releaseTrackCountryTabItem${releaseId}-${trackId}-${countryId}`,
        source: this.COUNTRIES,
        handler: async ({ country: countryIds, store: storeIds }) => {
          const countries = this._generateDataStructure([
            { source: this.COUNTRIES, ids: countryIds },
            { source: this.STORES, ids: storeIds },
          ]);
          this._updateAddMutationsInStore(countries, [releaseId, trackId]);
          return {
            releaseId,
            trackId,
            countries,
          };
        },
      },
      store: {
        title: "Select Stores",
        items: () => this._generateIdAndTitleObjList(this.STORES, "store"),
        containerId: `#releaseTrackCountryTableBody${releaseId}-${trackId}-${countryId}`,
        elementId:
          storeId &&
          `#releaseTrackCountryStoreItem${releaseId}-${trackId}-${countryId}-${storeId}`,
        templateName: "store",
        source: this.STORES,
        handler: async ({ store: storeIds }) => {
          const stores = this._generateDataStructure([
            { source: this.STORES, ids: storeIds },
          ]);
          this._updateAddMutationsInStore(stores, [
            releaseId,
            trackId,
            countryId,
          ]);
          return {
            releaseId,
            trackId,
            countryId,
            stores,
          };
        },
      },
    };
    return containers[type.toLowerCase()];
  }
}
