import View from "../View";

export default Controller => {
  const { getElement } = View;
  let t;

  if (location.pathname === "/fmadmincp") {
    (async () => {
      Controller.injectDashboardLoader();
      //I SHOULD HAVE USED PROMISE.ALL HERE BUT THERE IS A REASON ITS LIKE THIS
      await Promise.all([
        Controller.getTopBoxesData(),
        Controller.buildMainChart(),
        Controller.buildSubChart(),
        Controller.renderLogs()
      ]);
    })();
  }

  getElement("body").addEventListener("change", e => {
    const { id } = e.target;
    if (id === "hamburger") return Controller.handleMobileMenu(e.target);
  });

  getElement("body").addEventListener("click", e => {
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

  getElement("body").addEventListener("submit", e => {
    if (e.target.dataset.ignore) return;
    e.preventDefault();
    const { id } = e.target;
    if (id === "links-form") return Controller.handleStoreLinks(e.target);
  });
};
