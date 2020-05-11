import ReleaseModel from "../../models/client/release.model";
import ControllerIndex from "../controllerIndex";
import isObjEmpty from "../../utilities/isObjEmpty";

class AddMusicController extends ControllerIndex {
  constructor(View) {
    super();
    this.View = View;

    if (this.View.ADD_MUSIC_TERMS) {
      this.View.bindTermsForm();
    }

    if (this.View.INITIATE_RELEASE) {
      this.handleInitiateSelectAction = this.handleInitiateSelectAction.bind(
        this
      );
      this.handleInitiateSubmit = this.handleInitiateSubmit.bind(this);
      this.View.bindInitiateSelectAction(this.handleInitiateSelectAction);
      this.View.bindInitiateSubmit(this.handleInitiateSubmit);
    }

    if (this.View.ADD_MUSIC_INDEX) {
      this.View.bindToStoreOptions();
      this.View.initiateStores();
      this.View.bindToStoreList();
      this.handleReleaseSave = this.handleReleaseSave.bind(this);
      this.handleReleasePublish = this.handleReleasePublish.bind(this);
      this.View.bindDidStoreSelectionChange();
      this.View.bindSaveRelease(this.handleReleaseSave);
      this.View.bindPublishRelease(
        this.handleReleaseSave,
        this.handleReleasePublish
      );
    }

    if (this.View.RELEASE_TYPE === "album") {
      this.View.bindAlbumUI();
    }

    this.Release = new ReleaseModel();
  }

  async handleInitiateSelectAction(name, param) {
    const response = await this.Release.query(name, param).get();
    return response.data;
  }

  async handleInitiateSubmit(data) {
    const response = await this.Release.query("create").post(data);
    return response.data;
  }

  async handleReleaseSave(data, releaseType, releaseId) {
    try {
      const failedRequests = [];
      const { releaseData, trackData, checkedStores } = data;
      const { rawFormData, formFiles } = releaseData;
      const fileUrls = await this.uploadToCloudinary(
        formFiles,
        this.View.files
      );
      const toBeSubmittedReleaseData = { ...rawFormData, ...fileUrls };

      if (!isObjEmpty(toBeSubmittedReleaseData)) {
        const releaseResponse = await this.Release.query("update", {
          id: releaseId,
        }).update(toBeSubmittedReleaseData);
        if (releaseResponse.status === "error") failedRequests.push("release");
      }

      //TRACKDATA
      let trackResponse;
      if (releaseType === "track") {
        const { rawFormData, formFiles, formdata } = trackData;

        const { trackId } = formdata;
        const fileUrls = await this.uploadToCloudinary(
          formFiles,
          this.View.files
        );
        const toBeSubmittedTrackData = { ...rawFormData, ...fileUrls };

        if (!isObjEmpty(toBeSubmittedTrackData)) {
          if (trackId) {
            trackResponse = await this.Release.query("updateTrack", {
              releaseId,
              id: trackId,
            }).update(toBeSubmittedTrackData);
          } else {
            trackResponse = await this.Release.query("createTrack").post(
              toBeSubmittedTrackData
            );
          }
        }
      } else {
        trackResponse = await this.Release.query("createOrUpdateAlbumTracks", {
          releaseId,
        }).post(trackData);
      }

      if (trackResponse && trackResponse.status === "error")
        failedRequests.push("trackResponse");

      /// CHECKED STORES
      if (checkedStores.length) {
        const checkedStoresResponse = await this.Release.query(
          "createOrUpdateStores",
          { releaseId }
        ).post(checkedStores);
        if (checkedStoresResponse.status === "error")
          failedRequests.push("checkedStores");
      }

      console.log("SAVE HANDLER: ", failedRequests);
      return failedRequests.length ? false : true;
    } catch (err) {
      console.log("IT CAMEE TO THE BOTTOM: ", err);
      this.View.showAlert(err);
    }
  }

  async handleReleasePublish(id) {
    const response = await this.Release.query("publish", {
      id,
    }).update();
    return response;
  }
}

export default AddMusicController;
