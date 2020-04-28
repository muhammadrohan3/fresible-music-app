export default `
    <div class="analyticsAdd__option__container__item">
        <% const {stores} = TemplateData %>
        <div>
            <select class='form__input--element'>
                <option value=''>-- select --</option>
                <% stores.forEach(([id, name]) => { %>
                    <option value='<%= id %>'><%= name %></option>
                <% }) %>
            </select>
        </div>
        <div>
            <input type='number' class='form__input--element'>
        </div>
        <button class="analyticsAdd__option__container__item--delete">
            <span class="iconify" data-icon="bpmn:trash" data-inline="false"></span>
        </button>
    </div>
`;
