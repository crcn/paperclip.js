var protoclass = require("protoclass"),
BaseBinding    = require("./index");


function ScriptBinding (application, clip, scriptName) {
  this.application = application;
  this.clip        = clip;
  this.scriptName  = scriptName;
  this.script      = clip.script(scriptName);
}


protoclass(BaseBinding, ScriptBinding, {

  /**
   */

  bind: function (context) {

    if (this.watch !== false) {
      this.script.watch().update();
    }

    var self = this;

    this._binding = this.clip.bind(this.scriptName, function (value, oldValue) {

      self.value    = value;
      self.oldValue = oldValue;

      // defer to request animation frame when updating the DOM. A bit
      // more optimal for browsers
      self.application.animate(self);

    }).now();

    return this;
  },

  /**
   */

  unbind: function () {
    if (this._binding) this._binding.dispose();
    this._binding = undefined;
    return this;
  },

  /**
   */

  update: function () {
    this._onChange(this.value, this.oldValue);
  },

  /**
   * DEPRECATED
   */

  _onChange: function(value, oldValue) {

  }
});


module.exports = ScriptBinding;