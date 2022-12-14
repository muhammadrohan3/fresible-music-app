export default `<div class="container -u-mw-450">
<% const inputs = [{name: 'spotify', label: 'Spotify'},{name: 'apple', label: 'Apple Music'}, {name: 'itunes', label: 'iTunes'}, {name: 'amazon', label: 'Amazon'}, {name: 'deezer', label: 'Deezer'}, {name: 'boomplay', label: 'Boomplay'}, {name: 'audiomack', label: 'Audiomack'}, {name: 'youtube', label: 'Youtube'}, {name: 'youtubeMusic', label: 'Youtube Music'}, {name: 'tidal', label: 'Tidal'}, {name: 'napster', label: 'Napster'}] %>
<% let L; %>
<% const { formData = {}, formDataAttributes = {} } = TemplateData %>
<form
    class="form -u-form-input-spacing"
    id="links-form"
    data-action= "<%= formDataAttributes['action'] || 'addStoreLinks' %>"  
  >
    <div class="alert alert-info store-link">
      <%= (L = formData['slug']) && "https://fresible.link/" + L %>  
    </div>
    <% inputs.forEach(({name, label, type = 'text'}) => { %> 
      <div class="form__input">
      <label for="" class="form__input--label"><%= label %></label>
      <input type="<%= type %>" class="form__input--element" name="<%= name %>" value="<%= formData[name] || '' %>" />
    </div>
    <% }) %>
    <div class='text-center'>
      <button class='btn-primary'>Submit</button>
    </div>
    </form>
</div>`;
