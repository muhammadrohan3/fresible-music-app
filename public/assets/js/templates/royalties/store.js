export default `
<% const {releaseId, trackId, countryId, stores} = TemplateData; %> 
<% stores.forEach(({id: storeId, store, trackDownload = 0,
  trackDownloadEarning = 0, trackStream = 0,
  trackStreamEarning= 0}) => { %>
  <tr id="releaseTrackCountryStoreItem<%= releaseId %>-<%= trackId %>-<%= countryId %>-<%=storeId %>">
    <td>
      <div class="form__input">
        <div class="form__input--element">
        <%= store %>
        </div>
        <input
          type="hidden"
          name="storeId"
          value="<%= storeId %>"
        />
      </div>
    </td>
    <td>
      <div class="form__input">
        <input
          type="number"
          name="trackStream"
          class="form__input--element"
          value="<%= trackStream %>"
        />
      </div>
    </td>
    <td>
      <div class="form__input">
        <input
          type="number"
          name="trackStreamEarning"
          class="form__input--element"
          value="<%= trackStreamEarning %>"
        />
      </div>
    </td>
    <td>
      <div class="form__input">
        <input
          type="number"
          name="trackDownload"
          class="form__input--element"
          value="<%= trackDownload %>"
        />
      </div>
    </td>
    <td>
      <div class="d-flex">
        <div class="form__input">
          <input
            type="number"
            name="trackDownloadEarning"
            class="form__input--element"
            value="<%= trackDownloadEarning %>"
          />
        </div>
        <button
          class="analyticsAdd__option__container__item--delete ml-2"
          data-action="delete-store"
          data-action_data="<%= JSON.stringify({releaseId, trackId, countryId, storeId}) %>"
        >
          <span
            class="iconify"
            data-icon="bpmn:trash"
            data-inline="false"
          ></span>
        </button>
      </div>
    </td>
  </tr>
  <% }) %>
`;
