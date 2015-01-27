var protoclass = require("protoclass"),
_bind          = require("../utils/bind"),
Base           = require("./base");

function EventAttribute (options) {
  Base.call(this, options);

}

Base.extend(EventAttribute, {
  initialize: function () {

  },
  bind: function (context) {
    Base.prototype.bind.call(this, context);

    // convert onEvent to event
    var event = this.key.toLowerCase().replace(/^on/, "");

    this.node.addEventListener(event, _bind(this._onEvent, this));
  },
  _onEvent: function (event) {
    this.context.event = event;
    this.value.evaluate(this.context);
  },
  unbind: function () {

  }
});

module.exports = EventAttribute;