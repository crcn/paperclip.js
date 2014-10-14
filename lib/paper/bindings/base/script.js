var protoclass = require("protoclass"),
BaseBinding    = require("./binding");


function ScriptBinding (application, clip, scriptName) {
  this.application = application;
  this.clip        = clip;
  this.scriptName  = scriptName;
  this.script      = clip.script(scriptName);
}


protoclass(BaseBinding, ScriptBinding, {

  /**
   */

  _updateScript: true,

  /**
   */

  bind: function (context) {
    this.context = context;

    if (this._updateScript) {
      this.script.watch().update();
    }

    var self = this;

    this._binding = this.clip.bind(this.scriptName, function (value, oldValue) {
      self.value    = value;
      self.oldValue = oldValue;
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
