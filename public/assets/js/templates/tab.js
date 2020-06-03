export default `
<section>
<div class="royalties__inject__table__header">
<ul class="nav nav-tabs custom-tab royalties__inject__table__header__tabs" id="myTab" role="tablist">
  <% tabs = TemplateData %>
  <% tabs.forEach(({name, title, params}, index) => { %>
    <li class="nav-item custom-tab__item" id="addMusic-release-tab">
      <a
        class="nav-link custom-tab__item--link <%= index === 0 && 'active' %>"
        data-toggle="tab"
        role="tab"
        aria-controls="home"
        aria-selected="true"
        data-name="<%= name %>"
        data-params="<%= JSON.stringify(params) %>"
        ><%= title %></a
      >
    </li>
  <% }) %>
</ul>
</div>

<!-- Tab panes -->
<div class="tab-content">
  <table data-mobile-responsive="true"></table>
</div>
</section>
`;
