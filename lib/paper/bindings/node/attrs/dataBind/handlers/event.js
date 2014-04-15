var BaseDataBinding = require("./base"),
_                   = require("underscore");

function EventDataBinding () {
  BaseDataBinding.apply(this, arguments);
  this._onEvent = _.bind(this._onEvent, this);
}

BaseDataBinding.extend(EventDataBinding, {
  watch: false,
  propagateEvent: true,
  preventDefault: false,
  bind: function () {
    BaseDataBinding.prototype.bind.apply(this, arguments);

    var event = (this.event || this.name).toLowerCase(),
    name      = this.name.toLowerCase();

    if (name.substr(0, 2) === "on") {
      name = name.substr(2);
    }

    if (event.substr(0, 2) === "on") {
      event = event.substr(2);
    }


    this._updateScript(this.clip.script("propagateEvent"));
    this._updateScript(this.clip.script("preventDefault"));


    if (~["click", "mouseup", "mousedown", "submit"].indexOf(name)) {
      this.preventDefault = true;
      this.propagateEvent = false;
    }

    this._pge = "propagateEvent." + name;
    this._pde = "preventDefault." + name;

    this._setDefaultProperties(this._pge);
    this._setDefaultProperties(this._pde);
    
    (this.$node = $(this.node)).bind(this._event = event, this._onEvent);
  },
  unbind: function () {
    BaseDataBinding.prototype.unbind.call(this);
    return this.$node.unbind(this._event, this._onEvent);
  },
  _updateScript: function (script) {
    if (script) {
      script.update();
    }
  },
  _setDefaultProperties: function (ev) {
    var prop = ev.split(".").shift();
    if (!this.clip.has(ev) && !this.clip.has(prop) && this[prop] != null) {
      this.clip.set(ev, this[prop]);
    }
  },
  _onEvent: function (event) {


    if (this.clip.get("propagateEvent") !== true && this.clip.get(this._pge) !== true) {
      event.stopPropagation();
    }

    if(this.clip.get("preventDefault") === true || this.clip.get(this._pde) === true) {
     event.preventDefault();
    }

    if (this.clip.get("disable")) return;

    this.clip.data.set("event", event);
    this._update(event);
  },
  _update: function (event) {
    this.script.update();
  }
});

module.exports = EventDataBinding;