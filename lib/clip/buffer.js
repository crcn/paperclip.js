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
    if (this.clippedBuffer._updated) return;
    this.clippedBuffer.update();
  }
});


function ClippedBuffer (buffer, application) {
  bindable.Object.call(this);

  var self = this;
  this.application = application;

  this.bindings = [];
  this._data    = {};

  this.buffer   = buffer.map(function (part) {

    var ret;

    if (part.fn) {
      ret = new ClippedBufferPart(self, part);
      self.bindings.push(ret);
      return ret;
    } else {
      return { value: part };
    };
  });

  this.bufferLength = buffer.length;
  this.bindingsLength = this.bindings.length;
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
    for (var i = this.bindingsLength; i--;) {
      this.bindings[i].dispose();
    }
    this.bindings = undefined;
  },

  /**
   */

  update: function () {
    this._updating = true;
    for (var i = this.bindingsLength; i--;) {
      this.bindings[i].update();
    }
    this.set("value", this.text = this._getText());
  },

  /**
   */

  _getText: function () {

    var buffer = "";

    for (var i = 0, n = this.bufferLength; i < n; i++) {
      buffer += this.buffer[i].value || "";
    }


    return buffer;
  }
});

module.exports = ClippedBuffer;