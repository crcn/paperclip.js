var XMLParser = require("./xml"),
parser = new XMLParser();

var scripts = {};

module.exports = {

  /**
   */

  parse: function (xml) {
    console.log(parser.parse(xml).toJavaScript())
    return "module.exports = " + parser.parse(xml).toJavaScript();
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

    return scripts[nameOrContent] = eval(module.exports.parse(content));
  }
}

if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
  window.paperclip.compile = exports.compile;
  window.paperclip.script = exports.script;
  window.paperclip.template.compiler = exports;
}