var paperclip = require("./"),
fs            = require("fs");

module.exports = {

  extension: "pc",

  transform: function (content, filepath) {
    return paperclip.translator.parse(content);
  }
};
