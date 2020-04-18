export default input => {
  return input.dataset.ignore && input.removeAttribute("data-ignore");
};
