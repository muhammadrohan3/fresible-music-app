export default `
<div class="analyticsInitiate__stores">
<% const {type = 'stream', stores = [], selectedStores = {}} = TemplateData %>
<form data-type='<%= type %>' data-form_select='input' id='analytics-select-stores'>
  <div class="analyticsInitiate__stores__list">
  <% stores.forEach(({store, id}) => { %> 
    <div class="analyticsInitiate__stores_list--item">
    <input type="checkbox" name="<%= id %>" value=<%= id %> <%= selectedStores[id] && 'checked' %> />
    <span><%= store %></span>
  </div>
  <% }) %>
  </div>
  <div class="text-center mt-4">
  <button class="btn-primary py-2" type='submit'>Submit</button>
</div>
</form>
</div>
`;
