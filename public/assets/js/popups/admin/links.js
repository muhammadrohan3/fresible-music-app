export default `<div class="container -u-mw-450">
<% const inputs = [{name: 'spotify', label: 'Spotify'},{name: 'apple', label: 'Apple Music'}, {name: 'itunes', label: 'iTunes'}, {name: 'amazon', label: 'Amazon'}, {name: 'deezer', label: 'Deezer'}, {name: 'boomplay', label: 'Boomplay'}, {name: 'audiomack', label: 'Audiomack'}, {name: 'youtube', label: 'Youtube'}, {name: 'youtubeMusic', label: 'Youtube Music'}, {name: 'tidal', label: 'Tidal'}, {name: 'napster', label: 'Napster'}, {name: 'slug', label: 'Slug', type: 'hidden'}] %>
<% let L; %>
<form
    action=""
    class="form -u-form-input-spacing"
    id="links-form"
    <%= formDataAttributes['details'] && \`data-details=${formDataAttributes["details"]}\` %>
    data-type="<%= formDataAttributes['type'] || 'add' %>"
    data-submiturl="<%= formDataAttributes['details'] || '/fmadmincp/submission/store-links/create' %>"
    <%= formDataAttributes['data-query_include'] === undefined && 'data-query_include=true' %>   
  >
    <div class="alert alert-info store-link">
      <%= (L = formData['slug']) && \`https://fresible.link/${L}\` %>  
    </div>
    <% inputs.forEach(({name, label, type = 'text'}) => { %> 
      <div class="form__input">
      <label for="" class="form__input--label"><%= label %></label>
      <input type="<%= type %>" class="form__input--element" name="<%= name %>" value="<%= formData[name] || '' %>" />
    </div>
    <% }) %>
    </form>
</div>`;
