var XMLParser = require("./xml"),
parser = new XMLParser();

module.exports = {

  /**
   */

  parse: function (xml) {
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


    return scripts[nameOrContent] = eval(parser.parse(content));
  }
}