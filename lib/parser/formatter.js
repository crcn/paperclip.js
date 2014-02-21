var uglify = require("uglify-js"),
jsp        = uglify.parser,
pro        = uglify.uglify;

module.exports = {
  format: function (source) {
    var ast = jsp.parse(String(source));
    source = pro.gen_code(ast, { beautify: true });
    return source;
  }
}