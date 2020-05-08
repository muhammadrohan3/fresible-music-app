import Swal from "sweetalert2";
import View from "../View";
import Validator from "../utilities/validator";
import Template from "../components/Template";
import CloudinaryFileUploader from "../lib/cloudinaryFileUploader";

export default (TRACKLISTCONTAINER, ADDNEWTRACKBTN) => {
  const { getElement } = View;

  let lastTrackIndex = 0;

  const Files = new Map();
  //This array holds uploaded files
  const UPLOADED_FILES = [];
  const {
    url,
    upload_preset,
    release_id: RELEASE_ID,
  } = TRACKLISTCONTAINER.dataset;
  //INITIATE CLOUDINARY FILE UPLOADER;
  const FileUploader = new CloudinaryFileUploader({
    upload_preset,
    url,
    public_id: "music/musics/music",
  });

  const initiate = () => {
    if (!TRACKLISTCONTAINER) return;
    if (JSON.parse(TRACKLISTCONTAINER.dataset.existing).length) {
      checkForTracksAndRender();
    } else handleNew();
    //Click events handler
    TRACKLISTCONTAINER.addEventListener("click", (e) => {
      const clickedElem = e.target;
      const { num, type } = clickedElem.dataset;
      if (type === "edit") return handleEdit(num);
      if (type === "delete") return handleDelete(num);
    });

    //Change event handler for music title changes
    TRACKLISTCONTAINER.addEventListener("change", (e) => {
      let elem = e.target;
      const { target } = elem.dataset;
      if (elem.tagName === "INPUT") {
        if (elem.name === "title") return handleTitleChange(elem, target);
        if (elem.type === "file") {
          Files.set(elem.name, elem.files[0]);
        }
      }
    });

    //Submit event handlers
    TRACKLISTCONTAINER.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const form = e.target;
      const { num, type } = form.dataset;
      if (type === "done") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Are you sure?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, I'm done with this track",
        });
        if (result.dismiss) return;
        toggleTrack(num, true);
        return handleDone(num, true);
      }
    });
  };

  ADDNEWTRACKBTN.addEventListener("click", (e) => {
    e.stopPropagation();
    handleNew();
  });

  //syncs title changes between the track and its hidden state component (ON-CHANGE EVENT)
  const handleTitleChange = (elem, target) => {
    const albumSmall = getElement(target);
    return (albumSmall.textContent = elem.value);
  };

  const checkForTracksAndRender = () => {
    //Checks and render template for already existing Album tracks.
    const { existing } = TRACKLISTCONTAINER.dataset;
    //If there are no existing dataset return false
    if (!existing) return false;
    //Parses the data set and insert component for each
    JSON.parse(existing).forEach((data) => {
      insertComponent(data, true);
    });
    //Resets each individual track count
    resetTrackCount();
    return true;
  };

  const isAnyOpen = () => {
    const trackForms = Array.from(TRACKLISTCONTAINER.children);
    let status = false;
    //this loop checks to see if any big track is currently open (i.e -- under editing);
    for (let track of trackForms) {
      if (!track.classList.contains("-u-album-track-reverse")) return true;
    }
    return status;
  };

  const insertComponent = (data = {}, tab) => {
    lastTrackIndex++;
    const templateData = {
      i: lastTrackIndex,
      data,
    };
    TRACKLISTCONTAINER.insertAdjacentHTML(
      "beforeend",
      Template("albumTemplate", templateData)
    );
    tab && toggleTrack(lastTrackIndex, true);
    return lastTrackIndex;
  };

  const handleNew = () => {
    //Check if a track form is still open
    if (isAnyOpen())
      return View.showAlert(
        "You can add a new track form when you are done with opened one(s)"
      );
    const {} = TRACKLISTCONTAINER;
    //Inserts a track from component
    const trackNo = insertComponent({ releaseId: RELEASE_ID });
    return (window.location.hash = `track${trackNo}`);
  };

  const handleEdit = (num) => {
    if (isAnyOpen())
      return View.showAlert("You are not yet done with an active track");
    return toggleTrack(num, false);
  };

  const handleDelete = async (num) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.dismiss) return;
    const toRemove = getElement(`#track${num}`);
    TRACKLISTCONTAINER.removeChild(toRemove);
    return resetTrackCount();
  };

  const tracksNotValidated = () => {
    let status = false;
    if (isAnyOpen()) {
      status = "Close open track forms";
    }
    if (!TRACKLISTCONTAINER.children.length) {
      return "You cannot publish an album without tracks";
    }
    for (let trackContainer of TRACKLISTCONTAINER.children) {
      const trackForm = getElement("form", trackContainer);
      let validationPassed = Validator(trackForm);
      if (!validationPassed) {
        View.addClass(trackContainer, "-u-album-track-error");
        status = true;
      } else View.removeClass(trackContainer, "-u-album-track-error");
    }
    return status;
  };

  const handleDone = async (num) => {
    const trackContainer = getElement(`#track${num}`, TRACKLISTCONTAINER);
    const trackForm = getElement("form", trackContainer);
    const musicInputElem = getElement(`input[type='file']`, trackForm);
    //Checks to see if the user changed the audio file, by checking for the data-ignore attribute
    if (musicInputElem.dataset.ignore) return true;
    const fileName = musicInputElem.name;
    if (!Files.get(fileName)) return true;
    //Checks to see if the file is uploaded or being uploaded
    if (UPLOADED_FILES.includes(fileName)) return true;

    //Uploads the file to the server
    const response = await FileUploader.upload(Files.get(fileName));
    //Adds the file to the uploaded files list to avoid duplicate uploads
    response.status === "success" && UPLOADED_FILES.push(fileName);
    debugger;
    //Stores the response of the server to the hidden input element
    const hiddenInput = getElement(`input[name='track']`, trackForm);
    hiddenInput.value = response.data.secure_url;
    return true;
  };

  const getAlbumTracks = async (distribute = false) => {
    const { release_id: releaseId } = TRACKLISTCONTAINER.dataset;
    const trackNodes = Array.from(TRACKLISTCONTAINER.children);
    const formData = [];

    for (let track of trackNodes) {
      const { num } = track.dataset;
      const form = View.getElement("form", track);
      const doneStatus = await handleDone(num, distribute);
      if (!doneStatus) return { status: "error" };
      const { rawFormData } = doneStatus && View.getFormData(form, true);
      formData.push({ ...rawFormData, releaseId });
    }
    return formData;
  };

  const toggleTrack = (trackNo) => {
    const track = getElement(`#track${trackNo}`, TRACKLISTCONTAINER);
    track.classList.toggle("-u-album-track-reverse");
    return true;
  };

  const resetTrackCount = () => {
    TRACKLISTCONTAINER.children.forEach((item, i) => {
      const { num } = item.dataset;
      const trackCountNode = item.querySelector(
        `#track-count-${num}`,
        TRACKLISTCONTAINER
      );
      trackCountNode.value = i + 1;
      trackCountNode.textContent = i + 1;
    });
    return true;
  };

  const generateToken = (n) => {
    let token = "";
    for (let i = 1; i <= n; i++) {
      token += Math.floor(Math.random() * 9);
    }
    return token;
  };

  return {
    initiate,
    tracksNotValidated,
    getAlbumTracksData: getAlbumTracks,
    addNewTrackForm: handleNew,
  };
};
