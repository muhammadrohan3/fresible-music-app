export default `
<section
class="stores"
>
<ul class="stores__list">
  <% TemplateData.forEach(({store, storeLogoId, checked = false, id}) => { %>
  <li class="stores__list__item">
    <div class="stores__list__item__store">
      <div class="stores__list__item__store--name">
        <div class="form__input__radio">
          <input
            type="checkbox"
            class="form__input__radio--element"
            value="<%= id %>"
            name="storeId"
            <%= checked && 'checked' %>
          />
          <label for="" class="form__input--label"><%= store %></label>
        </div>
      </div>
    </div>
    <div class="stores__list__item__logo"></div>
  </li>
  <% }) %>
</ul>
</section>
`;
