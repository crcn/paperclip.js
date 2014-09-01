var protoclass = require("protoclass");

function BaseExpression () {
}

protoclass(BaseExpression, {
  toJavaScript: function () {
    return "void 0";
  }
});

module.exports = BaseExpression;