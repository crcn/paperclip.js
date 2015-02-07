module.exports = function(ary) {

  var occurences = {};
  var clone      = ary.concat();

  for (var i = clone.length; i--;) {
    var item = clone[i];
    if (!occurences[item]) occurences[item] = 0;

    if (++occurences[item] > 1) {
      clone.splice(i, 1);
    }
  }

  return clone;
};
