import Swal from "sweetalert2";
import ejs from "../ejs.min.js";
import { albumTemplate } from "../templates/albumTemplates";
import { getStore, setStore } from "../Store";

export default (Controller, View) => {
  document.addEventListener("DOMContentLoaded", () => {
    const { getElement } = View;
    //This script should only run if user is on the add-music page and about to add an album
    const albumElem = getElement("#album");
    //This condition makes sure this script is only executed when the album Id is available on the page
    if (!albumElem) return;
    const {
      responseHandler,
      submitForm,
      serverRequest,
      uploadFile,
      submitStatusHandler
    } = Controller;
    let R;
    let i = 0;
    const TRACKLIST = getElement("#track-list");

    //This array variable holds currently uploaded files;
    let uploadingFiles = [];
    //This function is hoisted and its called to add a track form after page loads
    handleNew();

    //Click events handler
    albumElem.addEventListener("click", e => {
      const clickedElem = e.target;
      const { num, type } = clickedElem.dataset;
      if (type === "edit") return handleEdit(num);
      if (type === "delete") return handleDelete(num);
    });

    getElement("#album-submit").addEventListener("click", () => handleSubmit());
    getElement("#new").addEventListener("click", () => handleNew());

    //Change event handler for music title changes
    albumElem.addEventListener("change", e => {
      let elem = e.target;
      const { target } = elem.dataset;
      if (elem.tagName === "INPUT" && elem.name === "title")
        return handleTitleChange(elem, target);
    });

    //Submit event handlers
    albumElem.addEventListener("submit", e => {
      e.preventDefault();
      const form = e.target;
      const { num, type } = form.dataset;
      if (type === "done") return handleDone(num);
    });

    const toggleTrack = (trackNo, status) => {
      const track = $(`#track${trackNo}`);
      return status
        ? track.addClass("-u-album-track-reverse")
        : track.removeClass("-u-album-track-reverse");
    };

    const handleDone = async num => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text:
          "You can edit other information on this track but you can't change the selected file(s) after clicking done",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, I'm done with this track"
      });
      if (result.dismiss) return;
      const trackForm = getElement(`#track${num}`);
      // const { rawFormData, formData } = View.getFormData(trackForm, true);
      toggleTrack(num, true);
      let fileName = `musicFile${num}`;
      const uploadedFiles = getStore("uploadedFiles");
      //Checks to see if the file is uploaded or being uploaded
      if (uploadedFiles && uploadedFiles.includes(fileName)) return;
      setStore("uploadedFiles", [fileName]);
      //pushes the currently uploading file to the array
      uploadingFiles.push(fileName);
      //Uploads the file to the server
      const uploadResponse = await uploadFile(fileName);
      //Stores the response of the server to the hidden input element
      const hiddenInput = trackForm.querySelector("input[type='hidden']");
      hiddenInput.value = uploadResponse.secure_url;
      //removes the just uploaded file from the array
      uploadingFiles = uploadingFiles.filter(item => item !== fileName);
      return;
    };

    const handleEdit = num => {
      return toggleTrack(num, false);
    };

    const handleDelete = async num => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
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

    const handleSubmit = async () => {
      View.showLoader(true);
      //checks if any track form is open
      if (isAnyOpen())
        return View.showAlert(
          "You still have opened form(s), complete them then try again..."
        );
      const albumForm = getElement("#album-form");
      let { submitnum } = albumForm.dataset;
      const { rawFormData } = View.getFormData(albumForm);
      if (!rawFormData["name"])
        return View.showAlert("Album name input field is empty");
      // Submit the album form to get the albumId
      const albumSubmitResponse = await submitForm(albumForm);
      if (!(R = responseHandler(albumSubmitResponse))) return;
      const { albumId } = R;
      // //Let's make sure all background uploads are complete
      const checkUploader = setInterval(
        async () => await submitAlbumTracks(albumId),
        1000
      );
      async function submitAlbumTracks(albumId) {
        try {
          //Checks if there is not file currently uploading and clears the interval if true;
          if (!uploadingFiles.length) {
            clearInterval(checkUploader);
            const formData = [];
            const trackForms = Array.from(TRACKLIST.children);
            trackForms.forEach(form => {
              const { rawFormData } = View.getFormData(form, true);
              formData.push({ ...rawFormData, albumId });
            });
            const submitResponse = await serverRequest({
              href: "/add-music/album-tracks",
              method: "post",
              data: formData
            });
            if (!(R = responseHandler(submitResponse))) return;
            const submitStatusResponse = await submitStatusHandler({
              submitStatus: parseInt(submitnum),
              albumId
            });
            if (!responseHandler(submitStatusResponse)) return;
            return View.refresh();
          }
        } catch (e) {
          console.log(e);
        }
      }
    };

    function resetTrackCount() {
      const list = Array.from(TRACKLIST.children);
      list.forEach((item, i) => {
        item.querySelector("#track-count").value = i + 1;
        item.querySelector("#small-count").textContent = i + 1;
      });
    }

    function generateToken(n) {
      let token = "";
      for (let i = 1; i <= n; i++) {
        token += Math.floor(Math.random() * 9);
      }
      return token;
    }

    function handleNew() {
      console.log("hi");
      //Check if a track form is still open
      if (isAnyOpen())
        return View.showAlert(
          "You can add a new track form when you are done with opened one(s)"
        );
      i = i + 1;
      const { url, upload_preset, stagename } = TRACKLIST.dataset;
      TRACKLIST.insertAdjacentHTML(
        "beforeend",
        ejs.render(albumTemplate, {
          i,
          token: generateToken(10),
          url,
          upload_preset,
          stagename
        })
      );
      window.location.hash = `track${i}`;
      return resetTrackCount();
    }
    function isAnyOpen() {
      const trackForms = Array.from(TRACKLIST.children);
      let status = false;
      //this loop checks to see if any big track is currently open (i.e -- under editing);
      trackForms.forEach(
        item => (status = !item.classList.contains("-u-album-track-reverse"))
      );
      return status;
    }
  });
};
