export default `<div class="container -u-mw-450">
  <form
    action=""
    class="form -u-form-input-spacing"
    id="links-form"
    data-type="add"
    data-submiturl="/fmadmincp/submission/store-links/create"
    data-query_include='true'
  >
    <div class="alert alert-info store-link"></div>
    <div class="form__input">
      <label for="" class="form__input--label">Spotify</label>
      <input type="text" class="form__input--element" name="spotify" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Apple</label>
      <input type="text" class="form__input--element" name="apple" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">iTunes</label>
      <input type="text" class="form__input--element" name="itunes" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Amazon</label>
      <input type="text" class="form__input--element" name="amazon" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Deezer</label>
      <input type="text" class="form__input--element" name="deezer" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Boomplay</label>
      <input type="text" class="form__input--element" name="boomplay" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Audiomack</label>
      <input type="text" class="form__input--element" name="audiomack" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Youtube</label>
      <input type="text" class="form__input--element" name="youtube" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Youtube Music</label>
      <input type="text" class="form__input--element" name="youtubeMusic" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Tidal</label>
      <input type="text" class="form__input--element" name="tidal" />
    </div>
    <div class="form__input">
      <label for="" class="form__input--label">Napster</label>
      <input type="text" class="form__input--element" name="napster" />
    </div>
    <input class="form__input--element" type="hidden" name="slug" id="links-form-slug" />
    <div class="text-center">
      <button class="btn-primary" type="submit">Submit</button>
    </div>
  </form>
</div>`;
