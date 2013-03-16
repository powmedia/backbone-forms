
//==================================================================================================
//FIELDSET
//==================================================================================================

Form.BootstrapFieldset = Form.Fieldset.extend({

  template: _.template('\
    <fieldset>\
      <% if (legend) { %>\
        <legend><%= legend %></legend>\
      <% } %>\
      <div data-fields></div>\
    </fieldset>\
  ')

});
