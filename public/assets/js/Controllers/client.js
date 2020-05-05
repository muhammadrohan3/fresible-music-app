import View from "../View";
import Swal from "sweetalert2";
import { setStore, getStore } from "../Store";
import SubmitForm from "../utilities/submitForm";
import serverRequest from "../utilities/serverRequest";
import OptionsTemplate from "../templates/options";
import uploadFile from "../utilities/uploadFile";
import mobileMenuHandler from "../utilities/handleMobileMenu";
import validator from "../utilities/validator";
import albumFunction from "../components/Album";
import { async } from "regenerator-runtime";

const Controller = () => {
  //Initiate the albumFunction
  const Album = albumFunction(View);
  //temporary request variable 'R'
  let R;
  //passes the view to the mobileMenuHandler
  const handleMobileMenu = mobileMenuHandler(View);
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

  /// Make asynchronous server request (jquery);

  // const serverRequest = ({ url, href, method, contentType, data }) => {
  //   href = href && href.startsWith("/") ? href.substr(1) : href;
  //   return new Promise((resolve, reject) => {
  //     $.ajax({
  //       url: url || `${location.origin}/${href}`,
  //       method: method || "get",
  //       withCredentials: true,
  //       processData: false,
  //       data: contentType ? data || null : JSON.stringify(data) || null,
  //       contentType: contentType ? false : "application/json",
  //       uploadProgress: (event, position, total, percentComplete) =>
  //         console.log("total: ", event, " completed: ", percentComplete),
  //       success: data => resolve(data),
  //       error: err => reject(err)
  //     });
  //   });
  // };

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

  const profileSetup = async () => {
    let setupCookie = View.getCookieValue("profileSetup");
    if (!setupCookie) return;
    let profileActive = parseInt(setupCookie);
    if (isNaN(profileActive)) return;
    const response = await serverRequest({
      href: `/profile-setup`,
      data: { profileActive },
    });
    if (!responseHandler(response)) return;
    return;
  };

  const updateMusicSubmission = async (data) =>
    await serverRequest({
      data,
    });

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

  const agreeTerms = async (form) => {
    View.showLoader(true);
    const { rawFormData } = View.getFormData(form);
    //Checks for an unchecked input box and alerts if there is
    for (let item of Object.values(rawFormData)) {
      if (!item)
        return View.showAlert(
          "Please agree to all terms and conditions to continue"
        );
    }
    return (Location.pathname = "/add-music/create");
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

  //HANDLE ADD-MUSIC TERMS AGREEMENT

  const handleAddMusicTerms = (form) => {
    const { rawFormData } = View.getFormData(form);
    const termInputValueList = Object.values(rawFormData);
    for (let termInputValue of termInputValueList) {
      if (!termInputValue)
        return View.showAlert("Please agree to all terms and conditions.");
    }
    return location.replace("/add-music/create");
  };

  //HANDLESELECTFILTER
  const handleSelectFilter = async (selectElement) => {
    View.showLoader(true);
    const { filter_target, filter_href } = selectElement.dataset;
    const response = await serverRequest({
      href: `${filter_href}/${selectElement.value}`,
      method: "get",
    });
    if (!(R = responseHandler(response))) return;
    const targetedSelectElement = View.getElement(filter_target);
    targetedSelectElement.innerHTML = ejs.render(OptionsTemplate, { items: R });
    targetedSelectElement.disabled = false;
    return View.showLoader(false);
  };

  //handleAddNewArtist
  const handleAddNewArtist = async (form) => {
    View.showLoader(true);
    const res = await submitForm(form);
    if (!responseHandler(res)) return;
    return location.replace("/artists");
  };

  //HANDLE_INITIATE_RELEASE
  const handleInitiateRelease = async (form) => {
    View.showLoader(true);
    const response = await submitForm(form);
    if (!(R = responseHandler(response))) return;
    return location.replace("/add-music?id=" + R.id);
  };

  return {
    serverRequest,
    responseHandler,
    uploadFile,
    submitStatusHandler: updateMusicSubmission,
    handleMobileMenu,
    closeAlert: () => View.showAlert(false),
    checkVerifyCookie,
    sendVerifyRequest,
    handleFile,
    completeProfile: async (e) => {
      View.showLoader(true);
      return await submitForm(e.target, true);
    },
    selectPackage,
    agreeTerms,
    handlePayment,
    queryPayment,
    submitForm,
    handleAddNewArtist,
    handleSelectAccountType,
    handleSelectFilter,
    handleAddMusicTerms,
    handleInitiateRelease,
    handleSaveRelease,
    handlePublishRelease,
    initialize: checkVerifyCookie,
  };
};

export default Controller;
