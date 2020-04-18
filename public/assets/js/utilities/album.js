import Swal from "sweetalert2";
import ejs from "../ejs.min.js";
import { albumTemplate } from "../templates/albumTemplates";
import { getStore, setStore } from "../Store";
import serverRequest, { responseHandler } from "./serverRequest";
import uploadFile from "./uploadFile";
import View from "../View";
import Validator from "./validator";

export default () => {
  const { getElement } = View;
  //This condition makes sure this script is only executed when the album element is available on the page
  let R;
  let i = 0;

  //This array variable holds currently uploaded files;
  let uploadingFiles = [];
  let uploadError = false;
  const TRACKLIST = getElement("#addMusic-album-track-list");

  const initiate = () => {
    if (!TRACKLIST) return;
    if (TRACKLIST.dataset.existing) checkForTracksAndRender();
    else handleNew();
    //Click events handler
    TRACKLIST.addEventListener("click", (e) => {
      const clickedElem = e.target;
      const { num, type } = clickedElem.dataset;
      if (type === "edit") return handleEdit(num);
      if (type === "delete") return handleDelete(num);
    });

    // getElement("#album-submit").addEventListener("click", () => handleSubmit());
    getElement("#new").addEventListener("click", () => handleNew());

    //Change event handler for music title changes
    TRACKLIST.addEventListener("change", (e) => {
      let elem = e.target;
      const { target } = elem.dataset;
      if (elem.tagName === "INPUT" && elem.name === "title")
        return handleTitleChange(elem, target);
    });

    //Submit event handlers
    TRACKLIST.addEventListener("submit", async (e) => {
      e.preventDefault();
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

  const checkForTracksAndRender = () => {
    //Checks and render template for already existing Album tracks.
    const { existing } = TRACKLIST.dataset;
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
    const trackForms = Array.from(TRACKLIST.children);
    let status = false;
    //this loop checks to see if any big track is currently open (i.e -- under editing);
    for (let track of trackForms) {
      if (!track.classList.contains("-u-album-track-reverse")) return true;
    }
    return status;
  };

  const insertComponent = (data = {}, tab) => {
    const { url, upload_preset, stagename } = TRACKLIST.dataset;
    i = i + 1;
    TRACKLIST.insertAdjacentHTML(
      "beforeend",
      ejs.render(albumTemplate, {
        i,
        token: generateToken(10),
        url,
        upload_preset,
        stagename,
        data,
      })
    );
    tab && toggleTrack(i, true);
    return;
  };

  const handleNew = () => {
    //Check if a track form is still open
    if (isAnyOpen())
      return View.showAlert(
        "You can add a new track form when you are done with opened one(s)"
      );
    //Inserts a track from component
    insertComponent();
    //Resets count of each track from to reflect the recent changes
    resetTrackCount();
    return (window.location.hash = `track${i}`);
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
    TRACKLIST.removeChild(toRemove);
    return resetTrackCount();
  };

  const handleTitleChange = (elem, target) => {
    const albumSmall = getElement(target);
    return (albumSmall.textContent = elem.value);
  };

  const tracksNotValidated = () => {
    let status = false;
    if (isAnyOpen()) {
      status = "Close open track forms";
    }
    const trackFormContainers = Array.from(TRACKLIST.children);
    if (!trackFormContainers.length)
      return "You cannot publish an album without tracks";
    for (let trackContainer of trackFormContainers) {
      const trackForm = getElement("form", trackContainer);
      let validationPassed = Validator(trackForm);
      if (!validationPassed) {
        View.addClass(trackContainer, "-u-album-track-error");
        status = true;
      } else View.removeClass(trackContainer, "-u-album-track-error");
    }
    return status;
  };

  const handleDone = async (num, check = false) => {
    const trackContainer = getElement(`#track${num}`);
    const trackForm = getElement("form", trackContainer);
    const musicInputElem = getElement(`#music${num}`);
    let fileName = `musicFile${num}`;
    //Checks to see if the user changed the audio file, by checking for the data-ignore attribute
    if (musicInputElem.dataset.ignore) return true;
    const fileInStore = (getStore("files") || {})[fileName];
    if (!fileInStore && !check) return true;
    const uploadedFiles = getStore("uploadedFiles");
    //Checks to see if the file is uploaded or being uploaded
    if (uploadedFiles && uploadedFiles.includes(fileName)) return true;

    //pushes the currently uploading file to the array
    uploadingFiles.push(fileName);
    //Uploads the file to the server
    const response = await uploadFile(fileName);
    if (!(R = responseHandler(response))) {
      uploadingFiles = uploadingFiles.filter((item) => item !== fileName);
      return check ? false : true;
    }
    setStore("uploadedFiles", [fileName]);
    //Stores the response of the server to the hidden input element
    const hiddenInput = trackForm.querySelector("input[type='hidden']");
    hiddenInput.value = R.secure_url;
    //removes the just uploaded file from the array
    uploadingFiles = uploadingFiles.filter((item) => item !== fileName);
    return true;
  };

  const handleSubmit = async (distribute = false) => {
    const { album_id: albumId } = TRACKLIST.dataset;
    const trackContainers = Array.from(TRACKLIST.children);
    const formData = [];

    for (let track of trackContainers) {
      const { num } = track.dataset;
      const form = View.getElement("form", track);
      const doneStatus = await handleDone(num, distribute);
      if (!doneStatus) return { status: false };
      const { rawFormData } = doneStatus && View.getFormData(form, true);
      formData.push({ ...rawFormData, albumId });
    }

    const submitResponse = await serverRequest({
      href: `/add-music/album-tracks${location.search}`,
      method: "post",
      data: formData,
      params: {
        albumId,
      },
    });

    if (!(R = responseHandler(submitResponse))) return false;
    return { status: true, data: R };
  };

  const toggleTrack = (trackNo, status) => {
    const track = $(`#track${trackNo}`);
    return status
      ? track.addClass("-u-album-track-reverse")
      : track.removeClass("-u-album-track-reverse");
  };

  const resetTrackCount = () => {
    const list = Array.from(TRACKLIST.children);
    list.forEach((item, i) => {
      const { num } = item.dataset;
      item.querySelector(`#track-count-${num}`).value = i + 1;
      item.querySelector(`#small-count-${num}`).textContent = i + 1;
    });
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
    handleSubmit,
  };
};
