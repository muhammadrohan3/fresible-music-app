import Swal from "sweetalert2";
import ViewIndex from "../viewIndex";
import Modal from "../../components/Modal";
import { getStore } from "../../Store";
const modal = new Modal("admin");

export default class ReleaseView extends ViewIndex {
  constructor() {
    super();
    const { data } = super.getElement("#submission").dataset;
    const { id, linkId, stageName, title, link, status } = JSON.parse(data);
    this.RELEASE_ID = id;
    this.LINK_ID = linkId;
    this.STAGE_NAME = stageName;
    this.RELEASE_TITLE = title;
    this.RELEASE_LINKS = link;
    this.RELEASE_STATUS = status;
    this.APPROVE_BTN = super.getElement("#approve");
    this.DECLINE_BTN = super.getElement("#decline");
    this.DECLINE_COMMENT_EDIT_BTN = super.getElement("#decline-comment-edit");
    this.DECLINE_COMMENT_BOX = super.getElement("#decline-comment");
    this.DELETE_BTN = super.getElement("#delete");
    this.EDIT_LINKS_BTN = super.getElement("#edit-links");
    this.ADD_LINKS_BTN = super.getElement("#add-links");
    this.LINKS_FORM_ID = "links-form";
  }

  async _mutationHelper(action, handler) {
    const { dismiss } = await Swal.fire({
      title: "Are you sure?",
      text: "Proceeding with this action will make changes to the system",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, proceed`,
    });
    if (dismiss) return;
    super.showLoader(true);
    const response = await handler(action, this.RELEASE_ID);
    return response;
  }

  bindApproveBtn(handler) {
    this.APPROVE_BTN.addEventListener("click", async (e) => {
      this.showLoader(true);
      const response = await this._mutationHelper("approve", handler);
      response && this.refresh();
    });
  }

  async _getDeclineCommentFromPopup() {
    const declineComment = this.DECLINE_COMMENT_BOX
      ? this.DECLINE_COMMENT_BOX.textContent.trim()
      : "";
    const { value: comment, dismiss } = await Swal.fire({
      input: "textarea",
      inputValue: declineComment,
      showCancelButton: true,
    });
    if (dismiss || comment.toLowerCase() === declineComment.toLowerCase())
      return;
    if (!comment) {
      super.showAlert("There should be a comment for the declined release");
    }
    return comment;
  }

  bindDeclineBtn(handler) {
    this.DECLINE_BTN.addEventListener("click", async (e) => {
      const comment = await this._getDeclineCommentFromPopup();
      if (!comment) return;
      this.showLoader(true);
      const response = await handler("decline", this.RELEASE_ID, { comment });
      response && this.refresh();
    });
  }

  bindDeclineEdit(handler) {
    this.DECLINE_COMMENT_EDIT_BTN.addEventListener("click", async (e) => {
      const comment = await this._getDeclineCommentFromPopup();
      if (!comment) return;
      this.showLoader(true);
      const response = await handler(this.RELEASE_ID, { comment });
      response && this.refresh();
    });
  }

  bindDeleteBtn(handler) {
    this.DELETE_BTN.addEventListener("click", async (e) => {
      this.showLoader(true);
      const response = await this._mutationHelper("delete", handler);
      response && super.replace("/fmadmincp/submissions");
    });
  }

  bindAddLinksBtn() {
    this.ADD_LINKS_BTN.addEventListener("click", (e) => {
      modal.prepare("links").launch();
    });
  }

  bindEditLinksBtn() {
    this.EDIT_LINKS_BTN.addEventListener("click", async (e) => {
      modal
        .prepare("links", {
          formData: this.RELEASE_LINKS,
          formDataAttributes: { action: "updateStoreLinks" },
        })
        .launch();
    });
  }

  bindLinksForm(handler) {
    document.body.addEventListener("submit", async (e) => {
      if (e.target.id !== this.LINKS_FORM_ID) return;
      this.showLoader(true);
      e.preventDefault();
      e.stopPropagation();
      const { action } = e.target.dataset;
      const { rawFormData } = this.getFormData(e.target);
      const data =
        action === "addStoreLinks"
          ? {
              formData: rawFormData,
              options: {
                stageName: this.STAGE_NAME,
                title: this.RELEASE_TITLE,
              },
            }
          : rawFormData;
      const response = await handler(action, data, {
        releaseId: this.RELEASE_ID,
        linkId: this.LINK_ID,
      });
      response && this.refresh();
    });
  }
}
