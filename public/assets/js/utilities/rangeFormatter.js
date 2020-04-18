export default (value, row) => {
  const growing = typeof row !== "object" ? row : row.growing;
  if (growing === null)
    return `<span class="analytics--range-invalid">N/A</span>`;
  return growing
    ? `<span class="analytics--range-up"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-up" data-inline="false"></span></span>`
    : `<span class="analytics--range-down"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-down" data-inline="false"></span></span>`;
};
