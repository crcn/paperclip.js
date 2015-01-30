module.exports = function (str) {
  var els = str.match(/<\w[^>]+/g);

  if (!els) return str;

  for (var i = 0, n = els.length; i < n; i++) {
    var el = els[i];
    var attstr = el.match(/<\w+\s?(.*)/)[1];

    if (!attstr) continue;
    var atts = attstr.match(/\w+(=['"].+?['"])?/g);

    str = str.replace(el, el.replace(attstr, atts.sort(function (a, b) {
      return a.split("=")[0] > b.split("=")[0] ? -1 : 1;
    }).join(" ")));
  }


  return str;
}