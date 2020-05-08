import View from "../View";
import Swal from "sweetalert2";
import { setStore, getStore } from "../Store";
import SubmitForm from "../utilities/submitForm";
import serverRequest from "../utilities/serverRequest";
import uploadFile from "../utilities/uploadFile";

const Controller = () => {
  //temporary request variable 'R'
  let R;
  //passes the view to the submit form function
  const submitForm = SubmitForm(View);

  const handleFile = (e) => {
    //Gets the parent container of the input="file" element
    let container = View.getElement(e).parentElement;
    //Gets the label element of the container
    const label = View.getElement("label", container);
    //Gets the preview element
    const preview = View.getElement("div", container);
    //Gets the necessary data from the container
    const { filelimit, filetype, public_id, url, upload_preset } = e.dataset;
    const [file] = e.files;
    if (!file) return;

    //GET THE UPLOADED FILE EXTENSION
    const splittedFileName = file.name.split(".");
    const uploadedFileType = splittedFileName[
      splittedFileName.length - 1
    ].toLowerCase();

    const _nullFileInput = (errorMessage) => {
      //nulls the file and output an error of filesize larger than the limit specified
      View.addContent(preview, errorMessage);
      e.value = null;
      View.addContent(label, `Select ${filetype}`);
    };

    if (
      filetype === "image" &&
      !["jpg", "jpeg", "png"].includes(uploadedFileType)
    )
      return _nullFileInput("Image format not supported");
    // if (
    //   file.type &&
    //   filetype === "audio" &&
    //   !["mp3", "wav", "mpeg"].includes(uploadedFileType)
    // ) {
    //   return _nullFileInput("Audio format not supported");
    // }
    //Comparing the actual file size to the limit set for the file
    if (file.size / 1000000 > filelimit)
      return _nullFileInput(`File is larger than ${filelimit}mb`);
    //Changes the label to indicate the file was successfully selected
    View.addContent(label, `Change ${filetype}`);
    //Saves the file details to the store
    setStore("files", { [e.name]: { public_id, url, file, upload_preset } });
    let html;
    //This conditional block just creates the appropriate preview dependent on the file type
    if (filetype === "image") {
      let imgSrc = URL.createObjectURL(file);
      html = `<img src=${imgSrc} class="form__file--preview-img">`;
    } else if (filetype === "audio") {
      let fileName = file.name;
      //This reduces the file name for longer file names to something small
      fileName =
        fileName.length > 15 ? `${fileName.substr(0, 15)}...` : fileName;
      html = `<span class="form__file--preview--audio">
              <span
                class="iconify mr-1"
                data-icon="dashicons:format-audio"
                data-inline="false"
                style="color: #0050BF;"
              ></span>
              <span class='text-truncate'>${fileName}</span>
            </span>`;
    }
    //Sends the preview to the View
    return View.addContent(preview, html, true);
  };

  const responseHandler = ({ status, data = true }, customMessage) => {
    //
    if (status === "error") {
      View.showAlert(customMessage || data);
      return false;
    }
    return data;
  };

  const checkVerifyCookie = () => {
    let email = View.getCookieValue("isVerified");
    if (!email) return null;
    setStore("cookieEmail", email);
    let htmlTemplate = `We need you to kindly verify your email address to gain full
      access to your dashboard
      <div class="page__alert--link">Click here to verify</div>`;
    return View.showAlert(htmlTemplate, true);
  };

  const sendVerifyRequest = async () => {
    View.showLoader(true);
    const response = await serverRequest({
      href: `/confirm-account`,
    });
    R = responseHandler(response);
    return (
      R &&
      View.showAlert(
        "<p><b>Yay!, </b>We just sent a verification link to your email address, do check before the link expires</p>",
        true
      )
    );
  };

  /////////////////////////////////// SELECT PACKAGE
  // @param e - target element
  const selectPackage = async (e) => {
    View.showLoader(true);
    let { account_type } = e.dataset;
    let packageId = parseInt(e.dataset.package);
    let artistId = null;

    //Checks if the user is a label
    if (account_type === "label") {
      const response = await serverRequest({
        href: "/select-package/get-artists",
        method: "get",
      });
      if (!(R = responseHandler(response))) return;
      //converts the array of artist information to an object containing the artist's ID and stageName
      const artists = R.reduce(
        (acc, { id, stageName }) => ({ ...acc, [id]: stageName }),
        {}
      );
      View.showLoader(false);
      //fires a popup asking the user to select an artist from the list
      const { value: artist, dismiss } = await Swal.fire({
        title: "Select Label Artist",
        input: "select",
        inputOptions: artists,
        inputPlaceholder: "-- select --",
        showCancelButton: true,
        inputValidator: (value) =>
          Promise.resolve(value ? null : "You need to select an artist"),
      });
      //Shows an alert if the user dismisses the popup
      if (!artist) return View.showAlert("You need to select an artist");
      artistId = Number(artist);
    }

    View.showLoader(true);
    const response = await serverRequest({
      href: "/select-package",
      data: { packageId, artistId },
    });
    if (!responseHandler(response)) return;
    return location.replace("/add-music");
  };

  const handlePayment = async (e) => {
    View.showLoader(true);
    let { id } = e.target.dataset;
    id = parseInt(id);
    const response = await serverRequest({
      href: `/payment`,
      data: { id },
    });
    if (!(R = responseHandler(response))) return;
    const { authorization_url } = R;
    return location.replace(authorization_url);
  };

  const queryPayment = async (e) => {
    View.showLoader(true);
    const { reference } = e.dataset;
    const response = await serverRequest({
      href: "/payment/verify",
      data: { reference },
    });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  const handleSelectAccountType = async (elem) => {
    const { account_type: accountType } = elem.dataset;
    if (!accountType) return;
    View.showLoader(true);
    const response = await serverRequest({
      href: "/select-account",
      data: { accountType },
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  //handleAddNewArtist
  const handleAddNewArtist = async (form) => {
    View.showLoader(true);
    const res = await submitForm(form);
    if (!responseHandler(res)) return;
    return location.replace("/artists");
  };

  return {
    serverRequest,
    responseHandler,
    uploadFile,
    closeAlert: () => View.showAlert(false),
    checkVerifyCookie,
    sendVerifyRequest,
    handleFile,
    selectPackage,
    handlePayment,
    queryPayment,
    submitForm,
    handleAddNewArtist,
    handleSelectAccountType,
  };
};

export default Controller;
