module.exports = function (to) {
  if (!to) to = {};
  for (var i = 1, n = arguments.length; i < n; i++) {
    var from = arguments[i];
    for (var key in from) {
      to[key] = from[key];
    }
  }
  return to;
}
