
/**
 */


function createRunner (context) {
  return {
    context: context,
    call: function () {

    }
  }
}


function boundScript (script) {

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

      if (!refs.length) return {
        dispose: function () {},
        now: now
      };

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


/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript (values) {

  var scripts = values.filter(function (value) {
    return typeof value !== "string";
  }).map(function (scripts) {
    return scripts.value;
  });

  function evaluate (runner) {
    return values.map(function (script) {

      if (typeof script === "string") {
        return script;
      }

      return script.value.run.call(runner);

    }).join("");
  }

  return {
    evaluate: function (context) { 
      return evaluate(createRunner(context)); 
    },
    bind: function (context, listener) {

      var bindings = [], runner = createRunner(context);

      function now () {
        listener(evaluate(runner));
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(context.bind(ref, now));
        }
      }

      return {
        now: now,
        dispose: function ()  {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }
    }
  }

}

module.exports = function (value) {
  if (value.length) {
    if (value.length === 1) return boundScript(value[0].value);
    return bufferedScript(value);
  } else {
    return boundScript(value);
  }
}