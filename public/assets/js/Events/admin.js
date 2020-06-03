import View from "../View";
import Loader from "../components/Loader";
import AdminAnalytics from "../components/AdminAnalytics";
import Analytics from "../components/Analytics";

export default (Controller) => {
  const { getElement } = View;
  let t;

  if (location.pathname === "/fmadmincp") {
    (async () => {
      Loader([
        "dash-graph",
        "dash-doughnut",
        "dash-adminlog",
        "dash-subscriberslog",
      ]);
      //I SHOULD HAVE USED PROMISE.ALL HERE BUT THERE IS A REASON ITS LIKE THIS
      await Promise.all([
        Controller.DashboardLoader.getTopBoxesData(),
        Controller.DashboardLoader.buildMainChart(),
        Controller.DashboardLoader.buildSubChart(),
        Controller.DashboardLoader.renderLogs(),
      ]);
    })();
  }

  if (location.pathname === "/fmadmincp/analytics") {
    (async () => {
      await Promise.all([
        AdminAnalytics.renderTable(),
        Analytics.GetTopBoxesData({ baseLink: "/fmadmincp/analytics/get" }),
        Analytics.BuildStoresChart({ baseLink: "/fmadmincp/analytics/get" }),
      ]);
    })();
  }

  if (location.pathname === "/fmadmincp/analytics/releases") {
    (async () =>
      await Analytics.initiate({
        top: { topBoxesBaseLink: "/fmadmincp/analytics/get" },
        bodyLink: "/fmadmincp/analytics/releases/get",
      }))();
  }

  if (location.pathname.search(/fmadmincp\/analytics\/releases\/\d+/gi) > 0) {
    (async () => {
      const { data } = View.getElement("#analytics").dataset;
      const { id: releaseId, status } = JSON.parse(data);
      await Analytics.initiate({
        top: {
          topBoxesBaseLink: "/fmadmincp/analytics/get",
          dataInput: { releaseId, status },
        },
        bodyLink: `/fmadmincp/analytics/releases/${releaseId}/get`,
      });
    })();
  }

  document.body.addEventListener("change", (e) => {
    const { id } = e.target;
    if (id === "hamburger") return Controller.handleMobileMenu(e.target);
  });

  document.body.addEventListener("click", (e) => {
    // e.preventDefault();
    const { id, classList } = e.target;
    if (id === "decline") return Controller.handleDecline(e.target);
    if (id === "changeRole") return Controller.handleChangeRole(e.target);
    if (id === "decline-comment-edit")
      return Controller.handleDeclineCommentEdit(e.target);
    if (id === "store-link") {
      return Controller.handleStoreLinksModal(e.target);
    }
    if (id === "convert-label")
      return Controller.handleConvertToLabel(e.target);

    if (id === "analytics-new-datasheet") return Controller.getAnalyticDates(e);

    if (id === "analyticsInitiateSubmit")
      return Controller.handleAnalyticsInitiate();
    //SAVING ANALYTICS
    if (id === "analyticsAdd-save") return Controller.handleAnalyticsSave();
    //PUBLISHING ANALYTICS
    if (id === "analyticsAdd-publish")
      return Controller.handleAnalyticsPublish();
    if (classList.contains("analyticsAdd__option--icon"))
      return AdminAnalytics.handleAddNewStoreInput(e.target);
    if (classList.contains("analyticsAdd__option__container__item--delete"))
      return AdminAnalytics.handleRemoveStoreInput(e.target);

    if (classList.contains("analyticsInitiate__header--btn")) {
      return AdminAnalytics.openSelectStoresModal(e.target);
    }
    return Controller.handleBasicAction(e.target);
  });

  document.body.addEventListener("submit", (e) => {
    if (e.target.dataset.ignore) return;
    e.preventDefault();
    const { id } = e.target;
    if (id === "links-form") return Controller.handleStoreLinks(e.target);
    if (id === "analytics-select-stores")
      return AdminAnalytics.handleStoresSelected(e.target);
  });

  //BOOTSTRAP EVENTS
  const toggleIcon = (status) => (e) => {
    $(e.target).prev().find(".iconify-tab-toggle").replaceWith(`<span
      class="iconify"
      data-icon="bx:bx-chevron-${status ? "up" : "down"}-circle"
      data-inline="false"
    ></span>`);
  };
  $("#analyticsAdd").on("hidden.bs.collapse", toggleIcon(false));
  $("#analyticsAdd").on("shown.bs.collapse", toggleIcon(true));
};
