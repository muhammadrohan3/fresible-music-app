export default `
<option value=''>-- select --</option>
<% items.forEach(([value, name]) => { %> 
  <% if(name && value) { %> 
    <option value="<%= value %>"><%= name %></option>  
  <% } %>
  <% }) %>
`;
