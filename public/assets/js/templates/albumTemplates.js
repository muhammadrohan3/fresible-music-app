export const albumTemplate = `
<div class="album__container__input-box" id="track<%= i %>">
  <form class="music-form" data-num="<%= i %>" data-type="done">
    <div class="music-form__head">
      <div class="music-form__head--box">
        <span>Upload Track</span> <span>(Only wav or mp3 supported)</span>
      </div>
      <div class="form__file">
        <label for="music<%= i %>" class="form__file--label btn-outline"
          >Select Item</label
        >
        <input
          type="file"
          name="musicFile<%= i %>"
          id="music<%= i %>"
          class="form__input--element form__file--input"
          accept="audio/wav, audio/mp3"
          data-filelimit="50"
          data-filetype="audio"
          data-url="<%= url %>"
          data-public_id="music/musics/music-<%= token %>"
          data-upload_preset="<%= upload_preset %>"
          data-ignore="true"
          required
        />
        <div class="form__file--preview text-truncate">
          <div>No file selected yet (Max size: 50mb)</div>
        </div>
      </div>
    </div>
    <div class="music-form__body">
      <div class="music-form__body__1">
        <div class="music-form__body__1--1">
          <div class="form__input">
            <input
              id="track-count"
              type="text"
              class="form-control form__input--element"
              value="<%= i %>"
              disabled
            />
          </div>
          <div class="form__input">
            <label class="form__input--label">
              <span></span>
              <span>*</span>
            </label>
            <input
              type="text"
              class="form__input--element"
              data-target="#small-title-<%= i %>"
              name="title"
              placeholder="Track Title"
              required
            />
            <div class="form__input--text"></div>
          </div>
        </div>
        <div class="form__input music-form__body__1--2">
          <label class="form__input--label">
            <span></span>
            <span>*</span>
          </label>
          <input
            type="text"
            class="form-control form__input--element"
            name="artiste"
            value="<%= stagename %>"
            disabled
          />
          <div class="form__input--text"></div>
        </div>
      </div>
      <div class="music-form__body__2">
        <div class="form__input music-form__body__2--1">
          <label class="form__input--label">
            <span></span>
            <span>*</span>
          </label>
          <select class="form__input--element" name="explicit" required>
            <option value="">Explicit Content</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form__input music-form__body__2--2">
          <label class="form__input--label">
            <span></span>
            <span>&nbsp;</span>
          </label>
          <input
            type="text"
            class="form__input--element"
            placeholder="Featured Artist(s) - separated by comma"
            name="featured"
          />
        </div>
      </div>
      <div class="music-form__body__3">
        <div class="music-form__body__3--1">
          <div class="form__input">
            <label class="form__input--label">
              <span></span>
              <span>*</span>
            </label>
            <input
              type="number"
              class="form__input--element"
              placeholder="Copyright Year"
              name="copyrightYear"
              required
            />
            <div class="form__input--text"></div>
          </div>
          <div class="form__input">
            <label class="form__input--label">
              <span></span>
              <span>*</span>
            </label>
            <input
              type="text"
              class="form__input--element"
              placeholder="Copyright Holder"
              name="copyrightHolder"
              required
            />
            <div class="form__input--text"></div>
          </div>
        </div>
        <div class="form__input music-form__body__3--2">
        <div class='form__input'>
          <label class="form__input--label">
            <span></span>
            <span>*</span>
          </label>
          <select name="genre" required class="form__input--element">
          <option value="">Select genre...</option>
        <option value="Alternative">Alternative</option
        ><option value="Alternative Rock">Alternative Rock</option
        ><option value="Baladas y Boleros">Baladas y Boleros</option
        ><option value="Big Band">Big Band</option
        ><option value="Blues">Blues</option
        ><option value="Brazilian">Brazilian</option
        ><option value="Children's">Children's</option
        ><option value="Christian">Christian</option
        ><option value="Comedy">Comedy</option
        ><option value="Contemporary Latin">Contemporary Latin</option
        ><option value="Country">Country</option
        ><option value="Easy Listening">Easy Listening</option
        ><option value="Educational">Educational</option
        ><option value="Electronic">Electronic</option
        ><option value="Enka">Enka</option
        ><option value="Experimental">Experimental</option
        ><option value="Fitness & Workout">Fitness &amp; Workout</option
        ><option value="Folk">Folk</option
        ><option value="French Pop">French Pop</option
        ><option value="German Folk">German Folk</option
        ><option value="German Pop">German Pop</option
        ><option value="Hip-Hop/Rap">Hip-Hop/Rap</option
        ><option value="Holiday">Holiday</option
        ><option value="Inspirational">Inspirational</option
        ><option value="Instrumental">Instrumental</option
        ><option value="J-Pop">J-Pop</option
        ><option value="Jazz">Jazz</option
        ><option value="K-Pop">K-Pop</option
        ><option value="Karaoke">Karaoke</option
        ><option value="Kayokyoku">Kayokyoku</option
        ><option value="Latin">Latin</option
        ><option value="Latin Jazz">Latin Jazz</option
        ><option value="Metal">Metal</option
        ><option value="New Age">New Age</option
        ><option value="Pop">Pop</option
        ><option value="Pop Latino">Pop Latino</option
        ><option value="Punk">Punk</option
        ><option value="R&B">R&amp;B</option
        ><option value="Raices">Raices</option
        ><option value="Reggae">Reggae</option
        ><option value="Regional Mexicano">Regional Mexicano</option
        ><option value="Rock">Rock</option
        ><option value="Singer/Songwriter">Singer/Songwriter</option
        ><option value="Soul">Soul</option
        ><option value="Spoken Word">Spoken Word</option
        ><option value="Vocal/Nostalgia">Vocal/Nostalgia</option
        ><option value="World">World</option
        ><option value="Chinese">Chinese</option
        ><option value="Original Pilipino Music">Original Pilipino Music</option
        ><option value="Trot">Trot</option></select> 
          <div class="form__input--text"></div>
          </div>
        </div>
        <input class="form__input--element" type="hidden" name="track" />
      </div>
    </div>
    <div class="music-form__done -u-flexerize">
      <div class="text-left">
        <button class="btn btn-danger" data-num="<%= i %>" data-type="delete">
          Remove
        </button>
      </div>
      <div class="text-right">
        <button
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
    <div class="album__track__small--number" id="small-count"><%= i %></div>
    <div class="album__track__small--title" id="small-title-<%= i %>"></div>
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
