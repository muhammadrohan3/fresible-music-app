export default View => element =>
  View[element.checked ? "removeClass" : "addClass"](
    "#main-page",
    "-u-close-menu"
  );
