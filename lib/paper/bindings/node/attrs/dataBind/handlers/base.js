var BaseScriptBinding = require("../../../../base/script");

function BaseDataBindHandler (application, node, clip, name) {
  this.node = node;
  BaseScriptBinding.call(this, application, this.clip = clip, this.name = name);
}

BaseScriptBinding.extend(BaseDataBindHandler, {
});

module.exports = BaseDataBindHandler;
