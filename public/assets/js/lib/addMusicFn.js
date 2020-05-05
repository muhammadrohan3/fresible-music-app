import formValidator from "../utilities/validator";
import isObjEmpty from "../utilities/isObjEmpty";

export const validateForms = (sectionNode, tabIdNode) => {
  let validationPassed = true;
  const forms = sectionNode.querySelectorAll("forms");
  forms.forEach((form) => {
    //if form validation fails (it applies the red border around inputs)
    if (!formValidator(form)) validationPassed = false;
  });
  if (!validationPassed) tabIdNode.classList.add("-u-border-error");
  else tabIdNode.classList.remove("-u-border-error");
  return validationPassed;
};

export const distributionTabValidator = (
  sectionNode,
  tabIdNode,
  radioInputsNodes = []
) => {
  let status = true;
  radioInputsNodes.forEach((radioInputsNode) => {
    const radioInputs = radioInputsNode.querySelectorAll('input[type="radio"]');
    const radioInputsValue = {};
    radioInputs.forEach(
      ({ checked, name, value }) => checked && (radioInputsValue[name] = value)
    );
    if (isObjEmpty(radioInputsValue)) {
      status = false;
    }
  });
  if (!status) tabIdNode.classList.add("-u-border-error");
  else tabIdNode.classList.remove("-u-border-error");

  return status;
};

export const getDistributionTabData = (
  trackPricingNode,
  storeOptionsNode,
  storeListNode,
  releaseId
) => {
  const _getRadioValue = (Node) => {
    const radioInputs = Node.querySelectorAll('input[type="radio"]');
    const radioInputsValue = {};
    radioInputs.forEach(({ checked, name, value }) => {
      return checked && (radioInputsValue[name] = value);
    });
    return radioInputsValue;
  };
  const price = _getRadioValue(trackPricingNode) || {};
  const storeType = _getRadioValue(storeOptionsNode) || {};
  const checkedStores = Array.from(storeListNode.querySelectorAll("input"))
    .filter((input) => input.checked)
    .map(({ value }) => ({ storeId: Number(value), releaseId }));

  console.log(price, storeType);

  return { releaseInfo: { ...price, ...storeType }, checkedStores };
};

// //HANDLE PUBLISH RELEASE
// const handlePublishRelease = async (data) => {

//   const { release_type } = View.getElement("#addMusic").dataset;
//   let tabHighlighted = false;
//   let alertShown = false;
//   const _highlightTab = (tab, status = true) => {
//     status && (tabHighlighted = true);
//     tab.style.border = status ? "1px solid red" : "none";
//   };

//   //
//   _highlightTab(RELEASE_TAB, false);
//   _highlightTab(OTHER_TAB, false);
//   //
//   const _checkForms = (formIds) => {
//     const statusList = formIds.map((formId) => {
//       const form = View.getElement(formId);
//       if (!form) return true;
//       const validateStatus = validator(form);
//       return validateStatus;
//     });
//     return statusList;
//   };
//   if (release_type === "album") {
//     const res = Album.tracksNotValidated();

//     if (res) {
//       //checks if the response was a string
//       if (typeof res === "string") {
//         View.showAlert(res);
//         alertShown = true;
//       }
//       _highlightTab(RELEASE_TAB);
//     }
//   }

//   const [
//     releaseDateFormStatus,
//     albumFormStatus,
//     trackFormStatus,
//   ] = _checkForms([RELEASE_DATE_FORM_ID, ALBUM_FORM_ID, TRACK_FORM_ID]);

//   if (!releaseDateFormStatus) _highlightTab(OTHER_TAB);

//   if (!albumFormStatus || !trackFormStatus) _highlightTab(RELEASE_TAB);

//   if (tabHighlighted) {
//     if (!alertShown)
//       View.showAlert("Error: some input fields require your action");
//     return;
//   }
//   const _executeAfterSave = async () => {
//     const response = await serverRequest({
//       href: "/add-music/publishRelease",
//       params: {
//         id,
//       },
//       data: {
//         oldStatus,
//       },
//     });
//     if (!(R = responseHandler(response))) return;
//     return location.replace(`/submission?id=${R.id}`);
//   };
//   return await handleSaveRelease(_executeAfterSave);
// };

// //HANDLE ADD-MUSIC SAVE
// const handleSaveRelease = async (callback = false) => {
//   //Checks if the callback is true (means, it was called by the publishRelease)
//   !callback && View.showLoader(true);
//   const RELEASE_DATE_FORM_ID = "#addMusic-release-date";
//   const ALBUM_FORM_ID = "#addMusic-album-form";
//   const TRACK_FORM_ID = "#addMusic-track-form";
//   //Gets the release type of the submission
//   const { release_type } = View.getElement("#addMusic").dataset;

//   //An array that holds the statuses of the form to be submitted
//   let Status = [];

//   //A helper function that runs a function with the params and checks the status of the response and makes decision
//   const _analyze = async (func, params, a = "s") => {
//     const res = await func.apply(null, params);
//     const { status, data } = res;
//     if (status === "error") {
//       Status.push(false);
//       return false;
//     }
//     return data;
//   };

//   //An helper that submit forms for this function
//   const _submitForm = async (formId) => {
//     const form = View.getElement(formId);
//     if (!form) return true;
//     //Submits the form and returns response for the _analyze function
//     return await submitForm(form, { strict: callback ? true : false });
//   };

//   //Release Date form handler
//   await _analyze(_submitForm, [RELEASE_DATE_FORM_ID], "release");

//   if (release_type === "track") {
//     const response = await _analyze(_submitForm, [TRACK_FORM_ID], "track");
//   } else {
//     //submission and analyzing of album related forms
//     await _analyze(_submitForm, [ALBUM_FORM_ID]);
//     await _analyze(Album.handleSubmit, [callback]);
//   }

//   //If any of the submission above fails, throw an error alert
//   if (Status.length)
//     return View.showAlert(
//       "Error: It seems your submission was not successful, check your internet connection and try again or contact admin",
//       5
//     );

//   //If there is callback, run the callback function
//   if (callback) return await callback();
//   //Refresh the view
//   return View.refresh();
// };
