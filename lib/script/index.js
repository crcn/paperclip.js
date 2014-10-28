
/**
 */


function createRunner (context) {
  return {
    context: context,
    call: function () {

    }
  }
}


module.exports = function (script) {

  var run = script.run, refs = script.refs;

  return {
    evaluate: function (context) {
      return run.call(createRunner(context));
    },
    bind: function (context, listener) {

      var runner = createRunner(context),
      currentValue;

      function now () {
        var oldValue = currentValue;
        listener(currentValue = run.call(runner), oldValue);
      }

      var dispose;

      if (!refs.length) return;

      if (refs.length === 1) {
        var dispose = context.bind(refs[0], now).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(context.bind(refs[i], now));
        }

        dispose = function () {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }

      return {
        dispose: dispose,
        now: now
      }
    }
  };
};