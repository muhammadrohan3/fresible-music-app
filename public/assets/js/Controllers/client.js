import View from "../View";
import Swal from "sweetalert2";
import { setStore, getStore } from "../Store";
import SubmitForm from "../utilities/submitForm";
import Validations from "../../../Validations";
import serverRequest from "../utilities/serverRequest";
import { packageInfoView } from "../templates/packageInfoView";
import OptionsTemplate from "../templates/options";
import uploadFile from "../utilities/uploadFile";
import mobileMenuHandler from "../utilities/handleMobileMenu";
import extractDataFromList from "../utilities/extractDataFromList";

export default () => {
  //temporary request variable 'R'
  let R;
  //passes the view to the mobileMenuHandler
  const handleMobileMenu = mobileMenuHandler(View);
  //passes the view to the submit form function
  const submitForm = SubmitForm(View);

  const handleFile = e => {
    //Gets the parent container of the input="file" element
    let container = View.getElement(e).parentElement;
    //Gets the label element of the container
    const label = View.getElement("label", container);
    //Gets the preview element
    const preview = View.getElement("div", container);
    //Gets the necessary data from the container
    const { filelimit, filetype, public_id, url, upload_preset } = e.dataset;
    const [file] = e.files;
    //Comparing the actual file size to the limit set for the file
    if (file.size / 1000000 > filelimit) {
      //nulls the file and output an error of filesize larger than the limit specified
      View.addContent(preview, `File is larger than ${filelimit}mb`);
      e.value = null;
      View.addContent(label, `Select ${filetype}`);
      return;
    }
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
      href: `/confirm-account`
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
      data: { profileActive }
    });
    if (response) return View.refresh();
  };

  const updateMusicSubmission = async data =>
    await serverRequest({
      data
    });

  const selectPackage = async e => {
    View.showLoader(true);
    let { label } = e.dataset;
    let artistId = null;
    //Checks if the user is a label
    if (label) {
      const response = await serverRequest({
        url: "/label/getArtists",
        data: { packageId }
      });
      if ((R = !responseHandler(response))) return;
      //converts the array of artist information to an object containing the artist's ID and stageName
      const artists = R.reduce(
        (acc, { id, stageName }) => ({ ...acc, [id]: stageName }),
        {}
      );
      //fires a popup asking the user to select an artist from the list
      const { value: artist, dismiss } = await Swal.fire({
        title: "Select Label Artist",
        input: "select",
        inputOptions: artists,
        inputPlaceholder: "-- select --",
        showCancelButton: true,
        inputValidator: value =>
          Promise.resolve(value ? null : "You need to select an artist")
      });
      //Shows an alert if the user dismisses the popup
      if (dismiss) return View.showAlert("You need to select an artist");
      artistid = artist;
      View.showLoader(true);
    }
    let packageId = parseInt(e.dataset.package);
    if (isNaN(packageId)) return null;
    const response = await serverRequest({
      data: { packageId, artistId }
    });
    if (!responseHandler(response)) return;
    await profileSetup();
    return location.replace("/add-music");
  };

  //HANDLE-PACKAGE-SELECT
  const handlePackageSelect = e => {
    const value = e.target.value;
    if (!value) {
      setStore("packageValue", false);
      return View.hide("#package-view");
    }
    let textColorMap = {
      active: "success",
      inactive: "danger"
    };
    const [
      name,
      status,
      trackStatus,
      id,
      albumStatus,
      notApplicable
    ] = value.split("-");
    setStore("package", { userPackageId: parseInt(id), notApplicable });
    $("#package-view").html(
      ejs.render(packageInfoView, {
        status,
        trackStatus,
        name,
        textColor: textColorMap[status],
        albumStatus
      })
    );
  };

  const handleReleaseInfo = async form => {
    View.showLoader(true);
    const response = await submitForm(form);
    if (!(R = responseHandler(response))) return;
    const submitStatus = parseInt(form.dataset.submitnum);
    const serverResponse = await serverRequest({
      data: {
        submitStatus,
        ...R
      }
    });
    if (!responseHandler(serverResponse, "Please try again...")) return;
    return View.refresh();
  };

  const addMusic = async function(e) {
    View.showLoader(true);
    //Get the packageValue from store set by handlePackageSelect function
    const { userPackageId, notApplicable } = getStore("package");
    if (!userPackageId)
      return View.showAlert("Select one from your subscriptions", true);
    const { rawFormData } = View.getFormData(e, true);
    const { type } = rawFormData;
    const [selectedType, full] = notApplicable.split("/");
    if (notApplicable && selectedType === type) {
      if (full)
        View.showAlert(
          `You have already exceeded the maximum number of ${selectedType}s you can add to this package`,
          true
        );
      else
        View.showAlert(
          `This subscription is not eligibe for ${selectedType} release`,
          true
        );
      return;
    }
    const response = await serverRequest({
      data: { userPackageId, type, submitStatus: 1 }
    });
    if (!(R = responseHandler(response, "Please try again..."))) return;
    return location.replace(`/add-music?id=${R.id}`);
  };

  const agreeTerms = async form => {
    View.showLoader(true);
    const { compno } = form.dataset;
    const { rawFormData } = View.getFormData(form);
    //Checks for an unchecked input box and alerts if there is
    for (let item of Object.values(rawFormData)) {
      if (!item)
        return View.showAlert(
          "Please agree to all terms and conditions to continue"
        );
    }
    //Sends a post request to the server to increase submit status
    const response = await serverRequest({
      data: { submitStatus: parseInt(compno) }
    });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  const confirmMusic = async e => {
    View.showLoader(true);
    const response = await serverRequest({
      data: { status: "processing" }
    });
    if (!responseHandler(response)) return;
    await profileSetup();
    return location.replace("/submissions");
  };

  const handlePayment = async e => {
    View.showLoader(true);
    let { id } = e.target.dataset;
    id = parseInt(id);
    const response = await serverRequest({
      href: `/payment`,
      data: { id }
    });
    if (!(R = responseHandler(response))) return;
    const { authorization_url } = R;
    return location.replace(authorization_url);
  };

  const queryPayment = async e => {
    View.showLoader(true);
    const { reference } = e.dataset;
    const response = await serverRequest({
      href: "/payment/verify",
      data: { reference }
    });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  //HANDLESELECTFILTER
  const handleSelectFilter = async selectElement => {
    View.showLoader(true);
    const { filter_target, filter_href } = selectElement.dataset;
    const response = await serverRequest({
      href: `${filter_href}/${selectElement.value}`,
      method: "get"
    });
    if (!(R = responseHandler(response))) return;
    const targetedSelectElement = View.getElement(filter_target);
    targetedSelectElement.innerHTML = ejs.render(OptionsTemplate, { items: R });
    targetedSelectElement.disabled = false;
    return View.showLoader(false);
  };

  //HANDLE_INITIATE_RELEASE
  const handleInitiateRelease = async form => {
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
    completeProfile: async e => {
      View.showLoader(true);
      return await submitForm(e.target, true);
    },
    selectPackage,
    handlePackageSelect,
    handleReleaseInfo,
    addMusic,
    updateMusicSubmission: async function(form) {
      View.showLoader(true);
      const { rawFormData } = View.getFormData(form);
      const { submitnum } = form.dataset;
      const response = await updateMusicSubmission({
        ...rawFormData,
        submitStatus: submitnum
      });
      if (!responseHandler(response)) return;
      return View.refresh();
    },
    agreeTerms,
    confirmMusic,
    handlePayment,
    queryPayment,
    submitForm,
    handleSelectFilter,
    handleInitiateRelease,
    initialize: checkVerifyCookie
  };
};
