var BaseBinding = require("./base"),
_bind = require("../../utils/bind");

function ModelBinding (view, node, script, attrName) {
  BaseBinding.apply(this, arguments);
  this._onInput = _bind(this._onInput, this);
}

BaseBinding.extend(ModelBinding, {

  _events: ["change","keyup","input"],

  bind: function (context) {
    BaseBinding.prototype.bind.call(this, context);

    var self = this;

    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onInput();
      }, process.browser ? 500 : 10);
    }

    this._events.forEach(function (event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  unbind: function () {
    BaseBinding.prototype.unbind.call(this);
    clearInterval(this._autocompleteCheckInterval);

    var self = this;
    this._events.forEach(function (event) {
      self.node.removeEventListener(event, self._onInput);
    });
  },

  /**
   */

  didChange: function (model) {
    this.model = model;

    if (this._modelBindings) this._modelBindings.dispose();
    if (!model) return;

    var self = this;

    this._modelBindings = this.context.bind(model.path, function (value) {
      self._elementValue(self._parseValue(value));
    }).now();
  },


  _parseValue: function (value) {
    if (value == null || value === "") return void 0;
    return value;
  },


  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  },

  /**
   */

  _onInput: function (event) {
    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }


    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function (value) {



    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio,
    isInput           = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());


    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.node.checked);
      } else if (isInput) {
        return this.node.value || "";
      } else {
        return this.node.innerHTML || "";
      }
    }

    if (value == null) {
      value = "";
    } else {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String(this.node.value)) {
          this.node.checked = true;
        }
      } else {
        this.node.checked = value;
      }
    } else if(value != this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }

});


module.exports = ModelBinding;