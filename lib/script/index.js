
/**
 */

function unboundScript (run, ref) {

  return {
    evaluate: function (context) {

      var binding = {
        context: context,
        call: function () { }
      };

      return run.call(binding);
    }
  };
}

function createRunner (context) {
  return {
    context: context,
    call: function () {

    }
  }
}


function boundScript (run, refs) {

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
}


module.exports = function (script) {
  return boundScript(script.run, script.refs);
}