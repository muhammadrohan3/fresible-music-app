export default input => {
  console.log(input);
  return input.dataset.ignore && input.removeAttribute("data-ignore");
};
