export default `
<% if(data) { %> 
  <% data.forEach(({user, action, link, userId, type, createdAt}) => { %>
    <div class="row logger__body__item">
      <span
        class='iconify logger__body__item--icon logger__body__item--icon--<%= isAdmin ? 'blue' : 'green' %>'
        data-icon='ant-design:notification-twotone'
        data-inline="false"
      ></span>
      <div class='logger__body__item--text'>
        <a href='/fmadmincp/subscriber?id=<%= 42351+userId %>'><%= user.firstName %></a> <%= action %>    
        <% if(link) { %> 
            <a
            href="/fmadmincp<%= link %>"
            ><%= type %></a> 
        <% } %>
      </div>
      <div class="logger__body__item--time"><%= timeFunc(createdAt) %></div>
    </div>
    <% }) %>
    <div class='mt-5 text-center'>
    <a class='btn-outline' href='/fmadmincp/logs?r=<%= isAdmin ? 'admin' : 'subscriber' %>'><%= isAdmin ? 'Admin' : 'Subscribers' %> Logs &raquo;</a>
    </div>
<% } %>
`;
