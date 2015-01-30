var sortAttrs = require("./sortAttrs");

module.exports = function (v) {
  return sortAttrs(String(v));
}