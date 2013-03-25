/**
 * DateTime editor
 *
 * @param {Editor} [options.DateEditor]           Date editor view to use (not definition)
 * @param {Number} [options.schema.minsInterval]  Interval between minutes. Default: 15
 */
Form.editors.DateTime = Form.editors.Base.extend({

  events: {
    'change select':  function() {
      this.updateHidden();
      this.trigger('change', this);
    },
    'focus select':   function() {
      if (this.hasFocus) return;
      this.trigger('focus', this);
    },
    'blur select':    function() {
      if (!this.hasFocus) return;
      var self = this;
      setTimeout(function() {
        if (self.$('select:focus')[0]) return;
        self.trigger('blur', self);
      }, 0);
    }
  },

  initialize: function(options) {
    options = options || {};

    Form.editors.Base.prototype.initialize.call(this, options);

    //Option defaults
    this.options = _.extend({
      DateEditor: Form.editors.DateTime.DateEditor
    }, options);

    //Schema defaults
    this.schema = _.extend({
      minsInterval: 15
    }, options.schema || {});

    //Create embedded date editor
    this.dateEditor = new this.options.DateEditor(options);

    this.value = this.dateEditor.value;

    //Template
    this.template = options.template || this.constructor.template;
  },

  render: function() {
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    var schema = this.schema;

    //Create options
    var hoursOptions = _.map(_.range(0, 24), function(hour) {
      return '<option value="'+hour+'">' + pad(hour) + '</option>';
    });

    var minsOptions = _.map(_.range(0, 60, schema.minsInterval), function(min) {
      return '<option value="'+min+'">' + pad(min) + '</option>';
    });

    //Render time selects
    var $el = $($.trim(this.template({
      hours: hoursOptions.join(),
      mins: minsOptions.join()
    })));

    //Include the date editor
    $el.find('[data-date]').append(this.dateEditor.render().el);

    //Store references to selects
    this.$hour = $el.find('select[data-type="hour"]');
    this.$min = $el.find('select[data-type="min"]');

    //Get the hidden date field to store values in case POSTed to server
    this.$hidden = $el.find('input[type="hidden"]');

    //Set time
    this.setValue(this.value);

    this.setElement($el);
    this.$el.attr('id', this.id);
    this.$el.attr('name', this.getName());

    if (this.hasFocus) this.trigger('blur', this);

    return this;
  },

  /**
   * @return {Date}   Selected datetime
   */
  getValue: function() {
    var date = this.dateEditor.getValue();

    var hour = this.$hour.val(),
        min = this.$min.val();

    if (!date || !hour || !min) return null;

    date.setHours(hour);
    date.setMinutes(min);

    return date;
  },

  /**
   * @param {Date}
   */
  setValue: function(date) {
    if (!_.isDate(date)) date = new Date(date);

    this.dateEditor.setValue(date);

    this.$hour.val(date.getHours());
    this.$min.val(date.getMinutes());

    this.updateHidden();
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$('select').first().focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$('select:focus').blur();
  },

  /**
   * Update the hidden input which is maintained for when submitting a form
   * via a normal browser POST
   */
  updateHidden: function() {
    var val = this.getValue();
    if (_.isDate(val)) val = val.toISOString();

    this.$hidden.val(val);
  },

  /**
   * Remove the Date editor before removing self
   */
  remove: function() {
    this.dateEditor.remove();

    Form.editors.Base.prototype.remove.call(this);
  }

}, {
  //STATICS
  template: _.template('\
    <div class="bbf-datetime">\
      <div class="bbf-date-container" data-date></div>\
      <select data-type="hour"><%= hours %></select>\
      :\
      <select data-type="min"><%= mins %></select>\
    </div>\
  ', null, Form.templateSettings),

  //The date editor to use (constructor function, not instance)
  DateEditor: Form.editors.Date
});
