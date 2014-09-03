var bindable = require("bindable"),
Clip         = require("./index"),
_            = require("underscore"),
protoclass   = require("protoclass");


function ClippedBufferPart (clippedBuffer, script) {

  this.clippedBuffer = clippedBuffer;

  this.clip = new Clip({
    script      : script,
    application : clippedBuffer.application
  });

  this.clip.bind("value", _.bind(this._onUpdated, this));
}

protoclass(ClippedBufferPart, {

  /**
   */

  dispose: function () {
    this.clip.dispose();
  },

  /**
   */

  update: function () {
    this.clip.reset(this.clippedBuffer._data);
    this.clip.update();
    this.value = this.clip.get("value");
  },

  /**
   */

  _onUpdated: function (value) {
    this.value = value;
    if (this.clippedBuffer._updating) return;
    this.clippedBuffer.update();
  }
});


function ClippedBuffer (buffer, application) {
  bindable.Object.call(this, this);

  var self = this;
  this.application = application;

  this.bindings = [];
  this._data    = {};

  this.buffer   = buffer.map(function (part) {

    var ret;

    if (part.value) {
      ret = new ClippedBufferPart(self, part.value);
      self.bindings.push(ret);
      return ret;
    } else {
      return { value: part };
    };
  });

}

bindable.Object.extend(ClippedBuffer, {

  /**
   */

  reset: function (data) {
    this._data = data;
    this.update();
    return this;
  },

  /**
   */

  dispose: function () {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
    this.bindings = [];
  },

  /**
   */

  update: function () {
    this._updating = true;
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].update();
    }
    this._updating = false;
    this.set("value", this._getText());
  },

  /**
   */

  _getText: function () {

    var buffer = "";

    for (var i = 0, n = this.buffer.length; i < n; i++) {
      var v = this.buffer[i].value;
      buffer += v != null ? v : "";
    }


    return buffer;
  }
});

module.exports = ClippedBuffer;
