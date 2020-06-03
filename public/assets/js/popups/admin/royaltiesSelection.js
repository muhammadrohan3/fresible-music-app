export default `
<div class="analyticsInitiate__stores">
  <% const {items = [], selectedItems = {}} = TemplateData %>
  <form data-form_select="input" id="royalties-collection">
    <div class="analyticsInitiate__stores__list">
      <% items.forEach(({title, id}) => { %>
      <div class="analyticsInitiate__stores_list--item">
        <input type="checkbox" name="<%= id %>" value="<%= id %>" <%=
        selectedItems[id] && 'checked disabled' %> />
        <span><%= title %></span>
      </div>
      <% }) %>
    </div>
    <div class="text-center mt-4">
      <button class="btn-primary py-2" type="submit">Submit</button>
    </div>
  </form>
</div>
`;
