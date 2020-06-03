import flatpickr from "flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index";

export default class DateUI {
  constructor() {
    this.configData = null;
    this.instance = null;
  }

  config(configData = {}) {
    this.configData = configData;
    return this;
  }

  _addPlugin(plugin) {
    const plugins = this.configData.plugins || [];
    this.configData.plugins = [...plugins, plugin];
  }

  monthYear() {
    const monthPluginSetup = new monthSelectPlugin({
      shorthand: true, //defaults to false
      dateFormat: "m.y", //defaults to "F Y"
      altFormat: "F Y", //defaults to "F Y"
      theme: "dark", // defaults to "light"
    });
    this._addPlugin(monthPluginSetup);
    return this;
  }

  render(elementIdentifier) {
    const instance = flatpickr(elementIdentifier, this.configData);
    this.instance = instance;
    return this;
  }

  toggle() {
    console.log(this.configData);
    if (!this.instance) return false;
    this.instance.toggle();
    return true;
  }
}
