export const ANALYTICS_REPORT_UI = `<div>
<div class="mb-3 -u-font-bold"><%= groupName %> Report</div>
<div class="mb-3 -u-font-small-light">
  Total <%= typeName %>
</div>
<div class="mb-3 -u-font-big"><%= stream %></div>
<div class="mb-3 -u-font-small-light">
  vs Previous <%= range %> days
</div>
<div class="-u-font-big">
  <%- rangeGrowthValue %>
</div>
</div>`;

export const analyticsGraphCanvas = `<canvas id="analytics-graph"></canvas>`;
