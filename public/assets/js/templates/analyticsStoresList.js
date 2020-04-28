export default `
<% const {selectedStores = [], type = ''} = TemplateData %>
<ul class="analyticsInitiate__body__list" data-type='<%= type %>'>
<% selectedStores.forEach(({store, id}) => { %> 
<li class="analyticsInitiate__body__list--item" data-id="<%= id %>">
  <%= store %>
</li>
<% }) %>
</ul>
`;
