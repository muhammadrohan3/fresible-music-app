export default `
<option value=''>-- select --</option>
<% TemplateData.forEach(([value, name]) => { %> 
  <% if(name && value) { %> 
    <option value="<%= value %>"><%= name %></option>  
  <% } %>
  <% }) %>
`;
