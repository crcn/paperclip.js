var XMLParser = require("./xml"),
parser        = new XMLParser();

var scripts = {}, parse;

module.exports = {

  /**
   */

  parse: parse = function (xml) {
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


    return scripts[nameOrContent] = eval(parser.parse(content).toJavaScript());
  }
}

if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
  window.paperclip.compile           = module.exports.compile;
  window.paperclip.script            = module.exports.script;
  window.paperclip.template.compiler = module.exports;
}