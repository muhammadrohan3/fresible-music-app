export default `
<% const {i, token, url, upload_preset, stagename, data} = TemplateData %>
<div class="album__container__input-box" data-num='<%= i %>' id="track<%= i %>">
<% const hashMap = {title ='', artiste = '', featured = '', copyrightYear = '', copyrightHolder = '', explicit = '', genre = '', track = '', trackUploadId = '', releaseId = ''} = data %>

<!--  -->

<% const genreList = [ \`Alternative\`, \`Alternative Rock\`, \`Baladas y Boleros\`, \`Big
              Band\`, \`Blues\`, \`Brazilian\`, \`Children's\`, \`Christian\`, \`Comedy\`,
              \`Contemporary Latin\`, \`Country\`, \`Easy Listening\`, \`Educational\`,
              \`Electronic\`, \`Enka\`, \`Experimental\`, \`Fitness & Workout\`, \`Folk\`,
              \`French Pop\`, \`French Pop\`, \`German Folk\`, \`German Pop\`,
              \`Hip-Hop/Rap\`, \`Holiday\`, \`Inspirational\`, \`Instrumental\`,
              \`J-Pop\`, \`Jazz\`, \`K-Pop\`, \`Karaoke\`, \`Kayokyoku\`, \`Latin\`, \`Latin
              Jazz\`, \`Metal\`, \`New Age\`, \`Pop\`, \`Pop Latino\`, \`Punk\`, \`R&B\`,
              \`Raices\`, \`Reggae\`, \`Regional Mexicano\`, \`Rock\`,
              \`Singer/Songwriter\`, \`Soul\`, \`Spoken Word\`, \`Vocal/Nostalgia\`,
              \`World\`, "World / Afrobeat", "World / Afro Pop", "World / Christian & Gospel", \`Chinese\`, \`Original Pilipino Music\`, \`Trot\`
]; %>

<!--  -->

<form class="music-form" data-num="<%= i %>" data-type="done" id='album-form-<%= i %>'>
<div class="music-form__head">
  <div class="music-form__head--box">
    <span>Upload Track</span> <span>(Only wav or mp3 supported)</span>
  </div>
  <div class="form__file">
    <label for="music<%= i %>" class="form__file--label btn-outline align-self-center"
      ><%= track ? 'Change Audio' : 'Select Audio' %></label
    >
    <input
      type="file"
      name="musicFile<%= i %>"
      id="music<%= i %>"
      class="form__input--element form__file--input"
      accept="audio/wav, audio/mp3"
      data-filelimit="50"
      data-filetype="audio"   
      <%= track && 'data-ignore="true"' %>
      <%= !track && 'required' %>
    />
    <div class="form__file--preview">
      <% if(track) { %>
      <span class="form__file--preview--audio">
        <div id="player-<%=i %>">
          <audio id="player-track-<%=i %>">
            <source src="<%= track %>" type="audio/mpeg" />
          </audio>
          <div
            id="player-container-<%=i %>"
            data-playerno="<%= i %>"
            class="player"
          >
            <span
              id="player-initiate-<%=i %>"
              data-playerno="<%= i %>"
              class="iconify player--play"
              data-icon="cil:media-play"
              data-inline="false"
            ></span>
            <span
              id="player-initiate-<%=i %>"
              data-playerno="<%= i %>"
              class="iconify player--pause"
              data-icon="ant-design:pause-outlined"
              data-inline="false"
            ></span>
          </div>
        </div>
      </span>
      <% }else{ %>
      <div>Max size: 50mb</div>
      <% } %>
    </div>   
  </div>
  <input type='hidden' name='trackUploadId' value="<%= trackUploadId || '' %>">
</div>
<div class="music-form__body">
  <div class="music-form__body__1">
    <div class="music-form__body__1--1">
      <div class="form__input">
        <input
          id="track-count-<%= i %>"
          type="text"
          class="form-control form__input--element"
          value="<%= i %>"
          disabled
        />
      </div>
      <div class="form__input">
        <label class="form__input--label">
          <span>Track Title</span>
          <span>*</span>
        </label>
        <input
          type="text"
          class="form__input--element"
          data-target="#small-title-<%= i %>"
          name="title"
          value="<%= title || '' %>"
          <%= title && 'data-ignore=true' %>
          required
        />
        <div class="form__input--text"></div>
      </div>
    </div>
  </div>
  <div class="music-form__body__2">
    <div class="form__input music-form__body__2--1">
      <label class="form__input--label">
        <span>Explicit Content</span>
        <span>*</span>
      </label>
      <select class="form__input--element" name="explicit" <%= explicit && 'data-ignore=true' %> required>
        <option value="<%= explicit || ''%>">
          <%= explicit || '-- select --' %>
        </option>
        <% [ 'Yes', 'No'].forEach(item => { %>
          <% if(!explicit || explicit && (explicit.toLowerCase().trim() !== item.toLowerCase())) { %>
            <option value="<%= item.toLowerCase() %>"><%= item %></option>
          <% } %>
         <% }) %>
      </select>
    </div>
    <div class="form__input music-form__body__2--2">
      <label class="form__input--label">
        <span>Featured Artist(s)</span>
        <span>&nbsp;</span>
      </label>
      <input
        type="text"
        class="form__input--element"
        name="featured"
        placeholder="featured artists should be separated by a comma"
        <%= featured && 'data-ignore=true' %>
        value="<%= featured || '' %>"
      />
    </div>
  </div>
  <div class="music-form__body__3">
    <div class="music-form__body__3--1">
      <% const years = new Array(2020-2009).fill(0).map((n, index) => 2020 -
          index) %>
      <div class="form__input">
        <label class="form__input--label">
          <span>Copyright Year</span>
          <span>*</span>
        </label>
        <select
          type="number"
          class="form__input--element"
          name="copyrightYear"
          <%= copyrightYear && 'data-ignore=true' %>
          required
        >
        <option value="<%= copyrightYear || '' %>"><%= copyrightYear || '-- select --' %></option>
          <% years.filter(year => year !== copyrightYear).forEach(year => { %>
            <option value="<%= year %>"><%= year %></option>
          <% }) %>
        </select>
        <div class="form__input--text"></div>
      </div>
      <div class="form__input">
        <label class="form__input--label">
          <span>Copyright Holder</span>
          <span>*</span>
        </label>
        <input
          type="text"
          class="form__input--element"
          name="copyrightHolder"
          <%= copyrightHolder && 'data-ignore=true' %>
          value="<%= copyrightHolder || '' %>"
          required
        />
        <div class="form__input--text"></div>
      </div>
    </div>
    <input class="form__input--element" type="hidden" name="track" <%= track
    && 'data-ignore=true' %> value='<%= track %>' />
    <input type="hidden" name="releaseId" value="<%= releaseId %>">
  </div>
</div>
<div class="music-form__done -u-flexerize">
  <div class="text-left">
    <button type='button' class="btn btn-danger" data-num="<%= i %>" data-type="delete">
      Remove
    </button>
  </div>
  <div class="text-right">
    <button
    id='album-action-edit-<%= i %>'
      class="btn-primary"
      data-num="<%= i %>"
      data-type="done"
      type="submit"
    >
      Done
    </button>
  </div>
</div>
</form>
  <div class="album__track__small">
    <div class="album__track__small--number" id="small-count-<%= i %>"><%= i %></div>
    <div class="album__track__small--title" id="small-title-<%= i %>"><%= title %></div>
    <div class="album__track__small--options" data-num="<%= i %>"
    data-type="edit">
      <span
        class="iconify"
        data-icon="feather:edit"
        data-inline="false"
      ></span>
    </div>
  </div>
</div>
`;
