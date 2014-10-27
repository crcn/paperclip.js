var fs        = require("fs"),
parser        = require("./parser");

module.exports = {
  extension: "pc",
  transform: function (content, filepath) {
    return parser.parse(content);
  }
};
