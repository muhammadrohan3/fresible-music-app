export default `
<% items.forEach(([value, name]) => { %> 
    <option value="<%= value %>"><%= name %></option>
  <% }) %>
`;
