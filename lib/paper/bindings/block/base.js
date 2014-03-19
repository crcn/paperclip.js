var BaseScriptBinding = require("../base/script");

function BaseBlockBinding (options) {

  var clip                = options.clip;
  this.section            = options.section;
  this.application        = options.application;
  this.nodeFactory        = this.application.nodeFactory;
  this.contentTemplate    = options.template;
  this.scriptName         = options.scriptName;
  this.childBlockTemplate = options.childBlockTemplate;

  this.script = clip.script(this.scriptName);

  BaseScriptBinding.call(this, this.application, clip, this.scriptName);
}

BaseScriptBinding.extend(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    this.clip.reset(context, false);
    return BaseScriptBinding.prototype.bind.call(this, context);
  },

  /**
   */

  unbind: function () {
    BaseScriptBinding.prototype.unbind.call(this);
    return this.clip.unwatch();
  },

  /**
   */

  test: function (node) {
    return false;
  }
});

module.exports = BaseBlockBinding;
