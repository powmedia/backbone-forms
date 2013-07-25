/**
 * Radio editor
 *
 * Renders a <ul> with given options represented as <li> objects containing radio buttons
 *
 * Requires an 'options' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 */
Form.editors.Radio = Form.editors.Select.extend({

  tagName: 'ul',

  events: {
    'change input[type=radio]': function() {
      this.trigger('change', this);
    },
    'focus input[type=radio]': function() {
      if (this.hasFocus) return;
      this.trigger('focus', this);
    },
    'blur input[type=radio]': function() {
      if (!this.hasFocus) return;
      var self = this;
      setTimeout(function() {
        if (self.$('input[type=radio]:focus')[0]) return;
        self.trigger('blur', self);
      }, 0);
    }
  },

  getValue: function() {
    return this.$('input[type=radio]:checked').val();
  },

  setValue: function(value) {
    this.$('input[type=radio]').val([value]);
  },

  focus: function() {
    if (this.hasFocus) return;

    var checked = this.$('input[type=radio]:checked');
    if (checked[0]) {
      checked.focus();
      return;
    }

    this.$('input[type=radio]').first().focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$('input[type=radio]:focus').blur();
  },

  /**
   * Create the radio list HTML
   * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   * @return {String} HTML
   */
  _arrayToHtml: function (array) {
    var html = [];
    var self = this;

     _.each(array, function(option, index) {
      var itemHtml = '';
      if (_.isObject(option)) {
        var val = (option.val || option.val === 0) ? option.val : '';
        var isSelected = (option.selected === true) ? " checked='checked'" : "";
        itemHtml += ('<label class="radio" for="'+self.id+'-'+index+'"><input type="radio" name="'+self.getName()+'" value="'+val+'" id="'+self.id+'-'+index+'"'+isSelected+' /> ');
        itemHtml += (option.label+'</label><br/>');
      } else {
        itemHtml += ('<label class="radio" for="'+self.id+'-'+index+'"><input type="radio" name="'+self.getName()+'" value="'+option+'" id="'+self.id+'-'+index+'"'+isSelected+' /> ');
        itemHtml += (option+'</label><br/>');
      }
      html.push(itemHtml);
    });

    return html.join('');
  }

});
