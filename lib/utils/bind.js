module.exports = function(callback, context) {
  // TODO - DO ME
  // if (callback.bind) return callback.bind.apply(void 0, [context].concat(Array.prototype.slice.call(arguments, 2)));
  return function() {
    return callback.apply(context, arguments);
  }
}
