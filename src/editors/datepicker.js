
/**
 * Bootstrap Datepicker
 * 
 * Quick editor to create a Bootstrap style datepicker (instead of multiple of dropdowns)
 * @see: http://www.eyecon.ro/bootstrap-datepicker/
 * @usage: takes 2 schema options, dateFormat and defaultValue

 schema: {
  MyDate: {
    type: "BackboneDatepicker",
    title: "My Date",
    options: [
      {  dateFormat: 'd/m/yyyy', defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() }
    ]
  }
}
 */
Form.editors.BackboneDatepicker = Form.editors.Base.extend({

  initialize: function(options) {
    Form.editors.Base.prototype.initialize.call(this, options);
    this.template = options.template || this.constructor.template;
  },

  render: function(){
    var $el = $($.trim(this.template({
      dateFormat: this.schema.options[0]["dateFormat"],
      value: this.schema.options[0]["defaultValue"]
    })));
    this.setElement($el);
    
    return this;
  },

}, {
  // STATICS
  template: _.template('<div class="input-append">\
  <input type="text" id="start_date" name="start_date" data-date-format="<%= dateFormat %>" class="datepicker input input-medium" readonly="readonly" value="<%= value %>">\
  <span class="add-on"><i class="icon-calendar"></i></span></div>', null, Form.templateSettings)
});
