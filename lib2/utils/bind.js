module.exports = function (callback, context) {
  return function () {
    return callback.apply(context, arguments);
  }
}
