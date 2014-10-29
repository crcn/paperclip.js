var BaseBinding = require("./base");

function ClassBinding (view, node, scripts, attrName) {
  BaseBinding.apply(this, arguments);
}

BaseBinding.extend(ClassBinding, {

  bind: function (context) {
    this._currentStyles = {};
    BaseBinding.prototype.bind.call(this, context);
  },

  /**
   */

  didChange: function (classes) {

    var classesToUse = this.node.getAttribute("class");
    classesToUse     = classesToUse ? classesToUse.split(" ") : [];

    for (var classNames in classes) {

      var useClass = classes[classNames];
      var classNamesArray = classNames.split(/,\s*/);

      for (var i = 0, n = classNamesArray.length; i < n; i++) {
        var className = classNamesArray[i];
        var j = classesToUse.indexOf(className);
        if (useClass) {
          if (!~j) {
            classesToUse.push(className);
          }
        } else if (~j) {
          classesToUse.splice(j, 1);
        }
      }
    }


    this.node.setAttribute("class", classesToUse.join(" "));
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1 && typeof attrValue[0] === "object";
  }
});


module.exports = ClassBinding;