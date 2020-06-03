export default `
<% TemplateData.forEach(({store, value, bgColor}) => { %>
<div class="store-royalty">
  <div
    class="store-royalty__color"
    style="background-color: <%= bgColor %>;"
  ></div>
  <div class="store-royalty__details">
    <div class="store-royalty__details__store"><%= store %></div>
    <div class="store-royalty__details__amount">₦<%= value %></div>
  </div>
</div>
<% }) %>
`;
