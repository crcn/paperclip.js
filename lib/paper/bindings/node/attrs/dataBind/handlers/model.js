var _             = require("underscore"),
ChangeAttrBinding = require("./change"),
BaseBinding       = require("./base"),
type              = require("type-component"),
dref              = require("dref"),
noselector        = require("noselector");

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

    this.$element = noselector(this.node, this.application.nodeFactory);

    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onElementChange();
      }, 500);
    }

    ModelAttrBinding.__super__.bind.apply(this, arguments);

    this._changeEvents = "change keyup input mousedown mouseup click";
    // this._changeEvents = ChangeAttrBinding.events;


    (this.$element).bind(this._changeEvents, this._onElementChange);
    this._nameBinding = this.clip.data.bind("name", this._onChange);
    this._onChange();
  },

  _onElementChange: function (event) {

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }
  

    var value = this._parseValue(this._elementValue()),
    name      = this._elementName(),
    refs      = this.script.refs,
    model     = this.clip.get("model"),
    ref;

    if (value) {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (this.clip.get("bothWays") !== false) {
      ref = name || (refs.length ? refs[0] : undefined);

      if (!name && model && !model.__isBindableReference) {
        model = this.context;
      }

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

  },

  unbind: function () {
    ModelAttrBinding.__super__.unbind.apply(this, arguments);
    clearInterval(this._autocompleteCheckInterval);
    if (this._modelBinding) this._modelBinding.dispose();
    if (this._nameBinding) this._nameBinding.dispose();
    this.$element.unbind(this._changeEvents, this._onElementChange);

  },

  _onChange: function () {
    var model = this.clip.get("model");

    var name = this._elementName();
    if (this._modelBinding) this._modelBinding.dispose();

    if (name) {
      this._modelBinding = model ? model.bind(name, _.bind(this._onValueChange, this)).now() : undefined;
    } else if (model && model.__isBindableReference) {
      this._modelBinding = model.clip.__context.bind(model.path, _.bind(this._onValueChange, this)).now();
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


  _elementName: function () {
    return this.$element.attr("name");
  },

  _elementValue: function (value) {



    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio,
    isInput           = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());


    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.$element.is(":checked"));
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
        if (String(value) === String(this.$element.val())) {
          this.$element.prop("checked", true);
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

module.exports = ModelAttrBinding;
