var BaseAttribute = require("./script");
var _bind         = require("../utils/bind");

/**
 */

function ValueAttribute(options) {
  this._onInput = _bind(this._onInput, this);
  BaseAttribute.call(this, options);
}

/**
 */

BaseAttribute.extend(ValueAttribute, {

  /**
   */

  _events: ["change", "keyup", "input"],

  /**
   */

  initialize: function() {
    var self = this;
    this._events.forEach(function(event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  bind: function() {
    BaseAttribute.prototype.bind.call(this);

    var self = this;

    // TODO - move this to another attribute helper (more optimal)
    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function() {
        self._onInput();
      }, process.browser ? 500 : 10);
    }
  },

  /**
   */

  unbind: function() {
    BaseAttribute.prototype.unbind.call(this);
    clearInterval(this._autocompleteCheckInterval);

    var self = this;
  },

  /**
   */

  update: function() {

    var model = this.model = this.currentValue;

    if (this._modelBindings) this._modelBindings.dispose();

    if (!model || !model.__isReference) {
      throw new Error("input value must be a reference. Make sure you have <~> defined");
    }

    var self = this;

    this._modelBindings = this.view.watch(model.path, function(value) {
      self._elementValue(self._parseValue(value));
    });

    this._modelBindings.trigger();
  },

  _parseValue: function(value) {
    if (value == null || value === "") return void 0;
    return value;
  },

  /**
   */

  _onInput: function(event) {

    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }

    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    if (String(this.model.value()) == String(value))  return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function(value) {

    var isCheckbox        = /checkbox/.test(this.node.type);
    var isRadio           = /radio/.test(this.node.type);
    var isRadioOrCheckbox = isCheckbox || isRadio;
    var hasValue          = Object.prototype.hasOwnProperty.call(this.node, "value");
    var isInput           = hasValue || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());

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
    } else if (String(value) !== this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }
});

/**
 */

ValueAttribute.test = function(value) {
  return typeof value === "object" && !value.buffered;
};

/**
 */

module.exports = ValueAttribute;
