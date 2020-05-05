import ReleaseModel from "../models/release.model";
import ControllerIndex from "./controllerIndex";

class AddMusicController extends ControllerIndex {
  constructor(View) {
    this.view = View;
    this.view.bindToStoreOptions();
    this.view.initiateStores();
    this.view.bindToStoreList();
    this.view.bindSaveRelease();
    this.release = new ReleaseModel();
  }

  async handleAddMusic(data) {
    const releaseType = this.view.RELEASE_TYPE;
    const { releaseData, trackData, checkedStores } = data;
    const { rawFormData, formFiles } = releaseData;
    const fileUrls = await this.uploadToCloudinary(formFiles, this.view.files);
    const toBeSubmittedReleaseData = { ...rawFormData, ...fileUrls };
    const releaseId = this.view.RELEASE_ID;
    const releaseResponse = await this.release
      .query("update", { id: releaseId })
      .put(toBeSubmittedReleaseData);
    //TRACKDATA
    let trackResponse;
    if (releaseType === "track") {
      const { rawFormData, formFiles, formdata } = trackData;
      const { trackId } = formdata;
      const fileUrls = await this.uploadToCloudinary(
        formFiles,
        this.view.files
      );
      const toBeSubmittedTrackData = { ...rawFormData, ...fileUrls };
      if (trackId) {
        trackResponse = await this.release
          .query("update", { releaseId: releaseId, id: trackId })
          .put(toBeSubmittedReleaseData);
      } else {
        trackResponse = await this.release
          .query("update")
          .create(toBeSubmittedReleaseData);
      }
    } else {
    }
  }
}

export default AddMusicController;
