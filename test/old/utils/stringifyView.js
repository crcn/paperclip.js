var sortAttrs = require("./sortAttrs");

module.exports = function(v) {
  v.render();
  return sortAttrs(String(v.toString()));
};
