module.exports = {
  makeTokenCodes: function (tokens) {
    var codes = {},
    code = 1000;

    for (var i = tokens.length; i--;) {
      codes[tokens[i].toUpperCase()] = code = code + 1;
    }

    return codes;
  }
}
