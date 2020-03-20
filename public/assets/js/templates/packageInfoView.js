export const packageInfoView = `<ul class="overview__cat__list">
<li class="overview__cat__list__item">
  <div class="u-flex-middle">
    <span
      class="iconify overview__cat__list__item--icon"
      data-icon="ei:check"
      data-inline="false"
    ></span>
    <span>Package:</span>
  </div>
  <span><%= name %></span>
</li>
<li class="overview__cat__list__item">
  <div class="u-flex-middle">
    <span
      class="iconify overview__cat__list__item--icon"
      data-icon="ei:check"
      data-inline="false"
    ></span>
    <span>Status:</span>
  </div>
  <div>
    <span class="badge badge-pill badge-<%= textColor %>"><%= status %></span>
  </div>
</li>
<li class="overview__cat__list__item">
  <div class="u-flex-middle">
    <span
      class="iconify overview__cat__list__item--icon"
      data-icon="ei:check"
      data-inline="false"
    ></span>
    <span>Tracks:</span>
  </div>
  <span><%= trackStatus %></span>
</li>
<li class="overview__cat__list__item">
  <div class="u-flex-middle">
    <span
      class="iconify overview__cat__list__item--icon"
      data-icon="ei:check"
      data-inline="false"
    ></span>
    <span>Albums:</span>
  </div>
  <span><%= albumStatus %></span>
</li>
</ul>
`;
