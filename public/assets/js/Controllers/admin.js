import "regenerator-runtime/runtime";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import moment from "moment";
import { async, promised } from "q";
import * as ejs from "../ejs.min.js";
import "../../../../node_modules/chart.js/dist/Chart";
import View from "../View";
import serverRequest from "../utilities/serverRequest";
import mobileMenu from "../utilities/handleMobileMenu";
import submitForm from "../utilities/submitForm";
import { modal } from "../components/Modal";
import DashboardLoader from "../components/AdminDashboard";
import AnalyticsLoader from "../components/AdminAnalytics";

export default () => {
  let R;
  const SubmitForm = submitForm(View);

  const handleMobileMenu = mobileMenu(View);
  const responseHandler = ({ status, data = true }, customMessage) => {
    if (status === "error") {
      View.showAlert(customMessage || data);
      return false;
    }
    return data;
  };

  const handleBasicAction = async (elem) => {
    const { url: href } = elem.dataset;
    if (!href) return;
    const shouldProceed = await View.confirmAction();
    if (!shouldProceed) return;
    View.showLoader(true);
    const response = await serverRequest({ href });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  const handleDecline = async (elem) => {
    const { url: href } = elem.dataset;
    if (!href) return;
    const shouldProceed = await View.confirmAction();
    if (!shouldProceed) return;
    const { value: comment } = await Swal.fire({
      input: "textarea",
      inputPlaceholder: "Comment on why the submission is declined here...",
      inputAttributes: {
        "aria-label": "Comment on why the submission is declined",
      },
      showCancelButton: true,
    });
    if (!comment) return View.showAlert("Decline comment is required");
    View.showLoader(true);
    const response = await serverRequest({ href, data: { comment } });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  //This handles the store links modal.
  const handleStoreLinksModal = async (elem) => {
    // View.showLoader(true);
    const formDataAttributes = {};
    let formData = {};
    //destructures the needed values from the element already set
    const { type, link_id: linkId, details } = elem.dataset;
    formDataAttributes["details"] = details;
    // form.setAttribute("data-details", details);
    //checks if the links are to be edited if they exist or to add a new set of links.
    if (type === "edit") {
      //Makes a get request to the server for links associated with the linkId in the db
      const response = await serverRequest({
        href: `/fmadmincp/submission/store-links?id=${linkId}`,
        method: "get",
      });
      //handles the response, emits the error "links not found" if there is an error,
      if (!(R = responseHandler(response, "Links not found"))) return;
      //assigns R containing the server data response to formData
      formData = R;
      //sets the data- attribute in order to submit the form to the right API endpoint.
      formDataAttributes[
        "submiturl"
      ] = `/fmadmincp/submission/store-links/update?id=${linkId}`;
      formDataAttributes["type"] = "edit";
      formDataAttributes["query_include"] = false;
    }
    let TemplateData = {};
    TemplateData = { formData, formDataAttributes };
    View.showLoader(false);
    modal.admin().prepare("links", { TemplateData }).launch();
    //Launches the bootstrap modal on the page
  };

  //This function handles the submit and edit functions of the release links form.
  const handleStoreLinks = async (form) => {
    View.showLoader(true);
    const { type, details } = form.dataset;
    if (type === "add") {
      const _slugify = (text) => text.trim().replace(/ /g, "-");
      //Parses the JSON encoded details object
      const { stageName, title } = JSON.parse(details);
      //Slugifies the stageName and title.
      let slugList = [_slugify(title), _slugify(stageName)];
      //A while loop with the stop boolean
      let stop = false;
      let index = 1;
      let endingNumber = 1;
      let slug = slugList[0];
      while (!stop) {
        //Makes a server request that checks for the slug
        slug = slug.toLowerCase();
        const { status } = await serverRequest({
          url: `/fmadmincp/submission/store-links/slug?slug=${slug}`,
          method: "get",
        });
        if (status === "success") {
          if (index >= 2) {
            slug = slug.concat(`-${endingNumber}`);
            endingNumber++;
          } else {
            index = index + 1;
            slug = slug.concat(`-${slugList[1]}`);
          }
        } else {
          stop = true;
        }
      }
      form.querySelector("#links-form-slug").value = slug;
      //Submits the form and awaits its response.
      const submitResponse = await SubmitForm(form);
      // A conditional check that assigns the result to the variable R if there is no error in the server response
      if (!(R = responseHandler(submitResponse))) return;
    } else if (type === "edit") {
      await SubmitForm(form);
    }
    return View.refresh();
  };

  //This function handles user role changes
  const handleChangeRole = async (elem) => {
    const { user_role, url } = elem.dataset;
    if (!user_role) return;
    const roles = {
      subscriber: "Subscriber",
      admin: "Admin",
      superAdmin: "Super Admin",
    };
    delete roles[user_role];
    const { value: role, dismiss } = await Swal.fire({
      title: "Assign New Role",
      input: "select",
      inputOptions: roles,
      inputPlaceholder: "-- select --",
      showCancelButton: true,
      inputValidator: (value) =>
        new Promise(
          (resolve) =>
            (value && resolve()) || resolve("You need to select a value")
        ),
    });
    if (dismiss) return;
    View.showLoader(true);
    const response = await serverRequest({ data: { role }, href: url });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  //DECLINE COMMENT EDIT
  const handleDeclineCommentEdit = async (elem) => {
    const { id } = elem.dataset;
    const declineComment = View.getElement(
      "#decline-comment"
    ).textContent.trim();
    const { value: comment, dismiss } = await Swal.fire({
      input: "textarea",
      inputValue: declineComment,
      showCancelButton: true,
    });
    if (dismiss || comment.toLowerCase() === declineComment.toLowerCase())
      return;
    if (!comment)
      return View.showAlert(
        "There should be a comment for the declined release"
      );
    View.showLoader(true);
    const response = await serverRequest({
      href: `/fmadmincp/submission/action/edit-comment?id=${id}`,
      data: { comment },
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  //CONVERT ACCOUNT TO LABEL
  const handleConvertToLabel = async (btn) => {
    View.showLoader(true);
    const { subscriber_id } = btn.dataset;
    if (!subscriber_id) return;
    const response = await serverRequest({
      href: `/fmadmincp/subscriber/action/change-to-label?subscriberId=${Number(
        subscriber_id
      )}`,
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  const getAnalyticDates = async (e) => {
    View.showLoader(true);
    e.stopPropagation();
    const { data } = await serverRequest({
      href: "/fmadmincp/analytics/new",
      method: "get",
    });
    const disable = data.length && data.map(({ date }) => date);
    View.showLoader(false);
    const hiddenInput = "#analytics-new-datasheet-input";
    const instance = flatpickr(hiddenInput, {
      ...(data.length ? { disable } : {}),
      clickOpens: false,
      onChange: handleNewAnalyticsDate,
    });
    instance.toggle();
  };

  const handleNewAnalyticsDate = async (selectedDates, date) => {
    View.showLoader(true);
    const response = await serverRequest({
      href: "/fmadmincp/analytics/new",
      data: { date: moment(date).format("YYYY-MM-DD") },
    });
    if (!(R = responseHandler(response))) return;
    return (location.pathname = `/fmadmincp/analytics/${R.id}`);
  };

  //HANDLE ANALYTICS INITIATE
  const handleAnalyticsInitiate = async () => {
    View.showLoader(true);
    const storeList = View.getElement("#analyticsInitiate").querySelectorAll(
      "ul"
    );
    const stores = {};
    Array.from(storeList).forEach((ul) => {
      const { type } = ul.dataset;
      const storeIds = Array.from(ul.querySelectorAll("li")).map((li) => {
        const { id } = li.dataset;
        return id;
      });
      stores[type] = storeIds;
    });
    if (!(stores.stream && stores.download))
      return View.showAlert("One or the two sections are empty");
    const response = await serverRequest({
      data: stores,
      href: location.pathname,
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  const handleAnalyticsPublish = async () => {
    const _publishCallback = async (data) => {
      const { dateId } = data;
      if (!dateId) throw new Error("HANDLEANALYTICSPUBLISH: dateId missing");
      const response = await serverRequest({
        href: `/fmadmincp/analytics/${dateId}/publish`,
      });
      if (!(R = responseHandler(response))) return;
      return View.replace("/fmadmincp/analytics");
    };
    return await handleAnalyticsSave(_publishCallback);
  };

  const handleAnalyticsSave = async (callback = false) => {
    View.showLoader(true);
    const { dateid: dateId } = View.getElement("#analyticsAdd").dataset;
    const DatasheetValues = [];
    let error = false;
    const releaseNodes = document.querySelectorAll(
      "#analyticsAdd .analyticsAdd__panel--release"
    );
    releaseNodes.forEach((releaseNode) => {
      const { releaseId, userId } = JSON.parse(releaseNode.dataset.release);
      const trackNodes = releaseNode.querySelectorAll(
        ".analyticsAdd__panel--track"
      );
      trackNodes.forEach((trackNode) => {
        const { trackId } = JSON.parse(trackNode.dataset.track);
        const trackOptionsNodes = trackNode.querySelectorAll(
          ".analyticsAdd__option"
        );
        trackOptionsNodes.forEach((trackOptionsNode) => {
          const { type } = trackOptionsNode.dataset;
          const trackOptionsItemsNodes = trackOptionsNode.querySelectorAll(
            ".analyticsAdd__option__container__item"
          );
          trackOptionsItemsNodes.forEach((trackOptionsItemsNode) => {
            const countNode = trackOptionsItemsNode.querySelector("input");
            const storeIdNode = trackOptionsItemsNode.querySelector("select");
            const count = countNode.value;
            const storeId = storeIdNode.value;
            //clear error border for all if there is any
            [storeIdNode, countNode, trackNode, releaseNode].forEach((node) => {
              node.classList.remove("-u-border-error");
            });
            if (callback && (!storeId || !count)) {
              error = true;
              [storeIdNode, countNode, trackNode, releaseNode].forEach(
                (node) => {
                  !node.classList.contains("-u-border-error") &&
                    node.classList.add("-u-border-error");
                }
              );
            }
            DatasheetValues.push({
              count: Number(count),
              storeId: Number(storeId),
              type,
              trackId,
              releaseId,
              userId,
              dateId: Number(dateId),
            });
          });
        });
      });
    });
    if (!DatasheetValues.length) return View.showAlert("Nothing to submit");
    if (error) return View.showAlert("It seems some input fields are empty");
    console.log(DatasheetValues);
    const response = await serverRequest({ data: DatasheetValues });
    if (!(R = responseHandler(response))) return;
    if (R && !callback) return View.refresh();
    return await callback(R);
  };

  return {
    handleMobileMenu,
    handleBasicAction,
    handleDecline,
    handleChangeRole,
    DashboardLoader,
    AnalyticsLoader,
    handleDeclineCommentEdit,
    handleStoreLinks,
    handleStoreLinksModal,
    handleConvertToLabel,
    handleAnalyticsInitiate,
    getAnalyticDates,
    handleAnalyticsSave,
    handleAnalyticsPublish,
  };
};
