var parser = require("./parser");

var scripts = {}, parse;

module.exports = {

  /**
   */

  parse: parse = function (html) {
    return '"use strict";' + "module.exports = " + parser.parse(html).toJavaScript();
  },

  /**
   */

  compile: function (nameOrContent) {
    var content;


    if (scripts[nameOrContent]) {
      return scripts[nameOrContent];
    }

    try {
      if (typeof $ !== "undefined") {
        content = $("script[data-template-name='" + nameOrContent + "']").html();
      }
    } catch (e) {

    }

    if (!content) {
      content = nameOrContent;
    }

    var source = '"use strict";return '+parser.parse(content).toJavaScript();


    return scripts[nameOrContent] = new Function(source)();
  }
}

if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
  window.paperclip.compile           = module.exports.compile;
  window.paperclip.script            = module.exports.script;
  window.paperclip.template.compiler = module.exports;
}
