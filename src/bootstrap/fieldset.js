
//==================================================================================================
//BOOTSTRAP FIELDSET
//==================================================================================================

Form.BootstrapFieldset = Form.Fieldset.extend({

  template: _.template('\
    <fieldset data-fields>\
      <% if (legend) { %>\
        <legend><%= legend %></legend>\
      <% } %>\
    </fieldset>\
  ')

});
