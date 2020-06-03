import {
  ReleaseModel,
  CountryModel,
  StoreModel,
  RoyaltyModel,
} from "../../models/admin/index";
import ControllerIndex from "../controllerIndex";

export default class ReleaseController extends ControllerIndex {
  constructor(View) {
    super();
    this.View = View;
    this.Release = new ReleaseModel();
    this.Country = new CountryModel();
    this.Store = new StoreModel();
    this.Royalty = new RoyaltyModel();
    if (this.View.ROYALTIES_EDIT_PAGE) {
      this.View.bindGetRoyaltiesDataFromServer(
        this.getStoresReleasesCountries.bind(this),
        this.getMonthRoyaltiesData.bind(this)
      );
      this.View.bindRoyaltiesEditPageButtonActions();
      this.View.bindListenForModalFormSubmissions();
      this.View.bindSaveMonthRoyaltiesDatasheet(
        this.saveMonthRoyaltiesDatasheet.bind(this)
      );
      this.View.ROYALTIES_STATUS === "processing" &&
        this.View.bindPublishMonthRoyaltiesDatasheet(
          this.publishMonthRoyaltiesDatasheet.bind(this)
        );
    }
    //
    if (location.pathname === "/fmadmincp/royalties") {
      this.View.bindNewDataSheetBtn(
        this.getAllMonths.bind(this),
        this.createNewMonth.bind(this)
      );
    }

    if (location.pathname === "/fmadmincp/royalties/index") {
      this.View.bindRoyaltiesComponent();
    }
  }

  async getAllMonths(params) {
    const allMonths = await this.Royalty.query("searchForMonth", params).get();
    return allMonths.data;
  }

  async createNewMonth(data) {
    const response = await this.Royalty.query("addMonth").post(data);
    return response.data;
  }

  async saveMonthRoyaltiesDatasheet(datasheet, monthId) {
    return await this.Royalty.query("save", { monthId }).post(datasheet);
  }

  async publishMonthRoyaltiesDatasheet(datasheet, monthId) {
    await this.saveMonthRoyaltiesDatasheet(datasheet);
    const response = await this.Royalty.query("publish", { monthId }).update();
    return response.data;
  }

  async getStoresReleasesCountries() {
    const { data: stores } = await this.Store.query("all").get();
    const { data: countries } = await this.Country.query("all").get();
    const { data: releases } = await this.Release.query(
      "liveForRoyalties"
    ).get();
    return { stores, releases, countries };
  }

  async getMonthRoyaltiesData(monthId) {
    const response = await this.Royalty.query("month", { monthId }).get();
    return response.data;
  }
}
