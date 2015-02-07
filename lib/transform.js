var fs        = require("fs");
var parser    = require("./parser");

module.exports = {
  extension: "pc",
  transform: function(content, filepath) {
    return parser.parse(content);
  }
};
