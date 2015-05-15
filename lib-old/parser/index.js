var parser  = require("./parser");
var scripts = {};
var parse;

/**
 */

module.exports = {

  /**
   */

  parse: parse = function(html) {
    return "\"use strict\";module.exports = " + parser.parse(html).toJavaScript();
  },

  /**
   */

  compile: function(nameOrContent) {
    var content;

    if (scripts[nameOrContent]) {
      return scripts[nameOrContent];
    }

    if (!content) {
      content = nameOrContent;
    }

    var source = "\"use strict\";return " + parser.parse(content).toJavaScript();

    return (scripts[nameOrContent] = new Function(source)());
  }
};

/* istanbul ignore if */
if (global.paperclip) {
  global.paperclip.parse           = module.exports.parse;
  global.paperclip.template.parser = module.exports;
}
