import View from "../View";
import Loader from "../components/Loader";

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
        // Controller.DashboardLoader.getTopBoxesData(),
        // Controller.DashboardLoader.buildMainChart(),
        Controller.AnalyticsLoader.buildStoresChart(),
      ]);
    })();
  }

  document.body.addEventListener("change", (e) => {
    const { id } = e.target;
    if (id === "hamburger") return Controller.handleMobileMenu(e.target);
  });

  document.body.addEventListener("click", (e) => {
    // e.preventDefault();
    const { id } = e.target;
    if (id === "decline") return Controller.handleDecline(e.target);
    if (id === "changeRole") return Controller.handleChangeRole(e.target);
    if (id === "decline-comment-edit")
      return Controller.handleDeclineCommentEdit(e.target);
    if (id === "store-link") {
      Controller.prepareModal("links");
      return Controller.handleStoreLinksModal(e.target);
    }
    if (id === "convert-label")
      return Controller.handleConvertToLabel(e.target);
    return Controller.handleBasicAction(e.target);
  });

  document.body.addEventListener("submit", (e) => {
    if (e.target.dataset.ignore) return;
    e.preventDefault();
    const { id } = e.target;
    if (id === "links-form") return Controller.handleStoreLinks(e.target);
  });

  //BOOTSTRAP EVENTS
  const toggleIcon = (status) => (e) => {
    $(e.target).prev().find(".iconify").replaceWith(`<span
      class="iconify"
      data-icon="bx:bx-chevron-${status ? "up" : "down"}-circle"
      data-inline="false"
    ></span>`);
  };
  $("#analyticsAdd").on("hidden.bs.collapse", toggleIcon(false));
  $("#analyticsAdd").on("shown.bs.collapse", toggleIcon(true));
};
