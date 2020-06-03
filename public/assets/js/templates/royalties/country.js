export default `
           <% const {releaseId, trackId, countries} = TemplateData; %>           
                             
           <% countries.forEach(({id: countryId, name, children: stores}) => { %>

            <div
              data-track=""
              class="analyticsAdd__panel analyticsAdd__panel--track bg-white"
              id="releaseTrackCountryTabItem<%= releaseId %>-<%= trackId %>-<%= countryId %>"
            >
              <div
                class="analyticsAdd__panel__heading"
                role="tab"
                id="headingSub<%= releaseId + "-" + trackId + "-" + countryId %>"
              >
                <a
                  role="button"
                  data-toggle="collapse"
                  data-parent="#releaseTrackSub<%= releaseId + "-" + trackId %>"
                  href="#releaseTrackCountrySub<%= releaseId + "-" + trackId + "-" + countryId %>"
                  aria-expanded="true"
                  aria-controls="releaseTrackCountrySub<%= releaseId + "-" + trackId + "-" + countryId %>"
                  class="analyticsAdd__panel__heading__link"
                >
                  <span class="analyticsAdd__panel__heading__link--text"
                    ><%= name %></span
                  >
                  <div class="d-flex align-items-center">
                    <button
                      class="analyticsAdd__option__container__item--delete mr-2"
                      data-action="delete-country"
                      data-action_data="<%= JSON.stringify({releaseId, trackId, countryId}) %>"
                    >
                      <span
                        class="iconify"
                        data-icon="bpmn:trash"
                        data-inline="false"
                      ></span>
                    </button>
                    <span
                      class="iconify iconify-tab-toggle"
                      data-icon="bx:bx-chevron-down-circle"
                      data-inline="false"
                    ></span>
                  </div>
                </a>
              </div>
              <!-- COUNTRY BODY -->
              <div
                id="releaseTrackCountrySub<%= releaseId + "-" + trackId + "-" + countryId %>"
                class="collapse"
                role="tabpanel"
                aria-labelledby="headingSub<%= releaseId + "-" + trackId + "-" + countryId %>"
              >
                <div class="royaltiesAdd__option__stores d-flex p-2">
                  <div
                    class="royaltiesAdd__option__stores d-flex align-items-center"
                  >
                    <button
                      class="analyticsAdd__option--icon"
                      data-action="new-store"
                      data-action_data="<%=JSON.stringify({releaseId, trackId, countryId}) %>"
                    >
                      +
                    </button>
                  </div>
                  <div class="royaltiesAdd__option__stores__table">
                    <table>
                      <thead>
                        <tr>
                          <th data-width="130">Store</th>
                          <th>Stream</th>
                          <th>Stream Earning</th>
                          <th>Download</th>
                          <th>Download Earning</th>
                        </tr>
                      </thead>
                      <tbody id="releaseTrackCountryTableBody<%=releaseId %>-<%= trackId %>-<%=countryId %>">
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
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <% }) %>
           `;
