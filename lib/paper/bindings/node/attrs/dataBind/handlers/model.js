var _             = require("underscore"),
ChangeAttrBinding = require("./change"),
BaseBinding       = require("./base"),
type              = require("type-component"),
dref              = require("dref");


function ModelAttrBinding () {
  this._elementValue = _.bind(this._elementValue, this);
  this._onValueChange = _.bind(this._onValueChange, this);
  this._onChange = _.bind(this._onChange, this);
  this._onElementChange = _.bind(this._onElementChange, this);
  ModelAttrBinding.__super__.constructor.apply(this, arguments);
}


BaseBinding.extend(ModelAttrBinding, {
  bind: function () {
    var self = this;


    if (/^(text|password)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onElementChange();
      }, 500);
    }

    ModelAttrBinding.__super__.bind.apply(this, arguments);

    (this.$element = $(this.node)).bind(ChangeAttrBinding.events, this._onElementChange);
    this._nameBinding = this.clip.data.bind("name", this._onChange);
    this._onChange();
  },

  _onElementChange: function (event) {

    if (event) event.stopPropagation();
    clearTimeout(this._changeTimeout);

    var self = this;


    function applyChange () {
      var value = self._parseValue(self._elementValue()),
      name      = self._elementName(),
      refs      = self.script.refs,
      model     = self.clip.get("model");


      if (self.clip.get("bothWays") !== false) {
        ref = name || (refs.length ? refs[0] : undefined);

        if (!name && !model.__isBindableReference) {
          model = self.context;
        }

        self.currentValue = value;

        if (model) {

          if (model.__isBindableReference) {
            model.value(value);
          } else if (model.set) {
            model.set(ref, value);
          } else {
            dref.set(model, ref, value);
          }
        }
      }
    }

    if (!process.browser) {
      applyChange();
    } else {
      this._changeTimeout = setTimeout(applyChange, 5);
    }
  },

  unbind: function () {
    ModelAttrBinding.__super__.unbind.apply(this, arguments);
    clearInterval(this._autocompleteCheckInterval);
    if (this._modelBinding) this._modelBinding.dispose();
    if (this._nameBinding) this._nameBinding.dispose();
    this.$element.unbind(ChangeAttrBinding.events, this._onElementChange);
  },

  _onChange: function () {
    var model = this.clip.get("model");

    var name = this._elementName();
    if (this._modelBinding) this._modelBinding.dispose();

    if (name) {
      this._modelBinding = model ? model.bind(name, _.bind(this._onValueChange, this)).now() : undefined;
    } else if (model && model.__isBindableReference) {
      this._onValueChange(model.value());
    } else if (type(model) !== "object") {
      this._onValueChange(model);
    }
  },

  _onValueChange: function (value) {
    this._elementValue(this._parseValue(value));
  },


  _parseValue: function (value) {
    if (value == null || value === "") return void 0;

    var script = this.clip.script("type");

    if (!script) return value;
    script.update();
    var type = this.clip.get("type");
    if (!type) return value;


    switch(type) {
      case "number": return Number(value);
      case "boolean": return Boolean(value);
      default: return value;
    }

  },

  _elementValue: function (value) {

    var isInput = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase())

    if (!arguments.length) return isInput ? this._checkedOrValue() : this.node.innerHTML;

    if (value == null) {
      value = "";
    }

    if (this.currentValue === value) {
      return;
    }

    this.currentValue = value;

    if (isInput) {
      this._checkedOrValue(value);
    } else {
      this.node.innerHTML = value;
    }
  },

  _elementName: function () {
    return $(this.node).attr("name");
  },

  _checkedOrValue: function (value) {

    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio;

    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean($(this.node).is(":checked"));
      } else {
        return this.node.value;
      }
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String($(this.node).val())) {
          $(this.node).prop("checked", true);
        }
      } else {
        this.node.checked = value;
      }
    } else {
      this.node.value = value;
    }
  }
});

module.exports = ModelAttrBinding;
