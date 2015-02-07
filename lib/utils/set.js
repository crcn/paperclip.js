module.exports = function (target, keypath, value) {
  var keys = keypath.split(".");

  var ct = target;

  for (var i = 0, n = keys.length-1; i < n; i++) {
    var key = keys[i];
    if (!ct[key]) {
      ct[key] = {};
    }
    ct = ct[key];
  }

  ct[keys[keys.length-1]] = value;
};
