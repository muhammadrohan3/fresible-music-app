import { ReleaseModel } from "../../models/admin/index";
import ControllerIndex from "../controllerIndex";

export default class ReleaseController extends ControllerIndex {
  constructor(View) {
    super();
    this.View = View;
    this.Release = new ReleaseModel();
    this.handleMutationBinding = this.handleMutationBinding.bind(this);
    this.handleLinksForm = this.handleLinksForm.bind(this);
    this.handleEditDeclineComment = this.handleEditDeclineComment.bind(this);
    this.View.APPROVE_BTN &&
      this.View.bindApproveBtn(this.handleMutationBinding);
    this.View.DELETE_BTN && this.View.bindDeleteBtn(this.handleMutationBinding);
    if (this.View.DECLINE_BTN) {
      this.View.bindDeclineBtn(this.handleMutationBinding);
    }
    if (this.View.RELEASE_STATUS === "declined") {
      this.View.bindDeclineEdit(this.handleEditDeclineComment);
    }

    this.View.ADD_LINKS_BTN && this.View.bindAddLinksBtn();
    this.View.bindLinksForm(this.handleLinksForm);
    this.View.EDIT_LINKS_BTN && this.View.bindEditLinksBtn();
  }

  async handleMutationBinding(action, id, data) {
    if (action === "delete") {
      return await this.Release.query("delete", { id }).delete();
    } else {
      return await this.Release.query(action, { id }).update(data);
    }
  }

  async handleLinksForm(action, data, { releaseId, linkId }) {
    if (action === "addStoreLinks") {
      return await this.Release.query(action, { id: releaseId }).post(data);
    }
    return await this.Release.query(action, { id: linkId }).update(data);
  }

  async handleEditDeclineComment(id, data = {}) {
    return await this.Release.query("editDeclineComment", { id }).update(data);
  }
}
