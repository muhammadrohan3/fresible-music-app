export default (target, tableData, dataColumns, functions = {}) => {
  const mainTable = $(target).find("table");
  const bgColors = ["", "rgba(239,240,246, 0.4)", "rgb(239,240,246)"];
  const _getParent = (elem, identifier, type = "tagName") => {
    const parents = $(elem).parents();
    for (parent of parents) {
      if (parent[type].toLowerCase() === identifier.toLowerCase())
        return parent;
    }
    return false;
  };

  const _clickFormatter = `<button class='analytics--view-btn' data-view_open='false'><span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span></button>`;

  const _buildTable = (data, table, columnIndex = 0, functions) => {
    const columns = dataColumns[columnIndex].map((column, i) => {
      const { formatter } = column;
      const formatterFn = functions[formatter];
      return { ...column, formatter: formatterFn };
    });

    const DetailsField = {
      field: "click",
      title: "Details",
      align: "center",
      formatter: _clickFormatter,
      events: {
        "click .analytics--view-btn": (...args) =>
          _handleNestClick(columnIndex, functions, ...args),
      },
    };

    //Add the default dropdown button
    if (columnIndex < dataColumns.length - 1) columns.push(DetailsField);
    //Builds the table
    table.bootstrapTable({
      columns,
      data,
      classes: "table table-bordered",
      mobile: true,
      mobileResponsive: true,
      pagination: data.length > 10 ? true : false,
    });
  };

  _buildTable(tableData, mainTable, 0, functions);

  function _handleNestClick(columnIndex, functions, e, val, row) {
    const $tr = $(_getParent(e.target, "tr"));
    const { view_open } = $(e.target).data();
    if (!view_open) {
      const index = row.children[0].level - 1;
      const $nTable = $(`<tr><td colspan=12><table
          data-mobile-responsive="true"
          style="width: 95%; margin: 0 auto; background-color: ${bgColors[index]}"
        ></table></td></tr>`)
        .insertAfter($tr)
        .find("table");
      _buildTable(row.children, $nTable, index, functions);
      $(e.target)
        .data("view_open", true)
        .html(
          `<span class="iconify" data-icon="ant-design:up-square-outlined" data-inline="false"></span>`
        );
    } else {
      $(e.target)
        .data("view_open", false)
        .html(
          `<span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span>`
        );
      $tr.next().remove();
    }
  }
};
