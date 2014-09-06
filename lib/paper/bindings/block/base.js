var BaseScriptBinding = require("../base/script");

function BaseBlockBinding (options) {

  var clip                = options.clip;
  this.section            = options.section;
  this.application        = options.application;
  this.nodeFactory        = this.application.nodeFactory;
  this.contentTemplate    = options.template;
  this.scriptName         = options.scriptName;
  this.childBlockTemplate = options.childBlockTemplate;

  BaseScriptBinding.call(this, this.application, clip, this.scriptName);
}

BaseScriptBinding.extend(BaseBlockBinding, {

  /**
   */

  _updateScript: false,

  /**
   */

  bind: function (context) {
    this.context = context;
    this.clip.reset(context, true);
    return BaseScriptBinding.prototype.bind.call(this, context);
  },

  /**
   */


  /**
   */

  unbind: function () {
    BaseScriptBinding.prototype.unbind.call(this);
    return this.clip.dispose();
  },

  /**
   */

  test: function (node) {
    return false;
  }
});

module.exports = BaseBlockBinding;
