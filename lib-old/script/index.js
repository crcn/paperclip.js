
// TODO: refactor me

/**
 */

function boundScript(script) {

  var run  = script.run;
  var refs = script.refs;

  return {
    refs: refs,
    evaluate: function(view) {
      return run.call(view);
    },
    watch: function(view, listener) {

      var currentValue;
      var locked = false;

      function now() {
        if (locked) return this;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(view), oldValue);
        locked = false;
        return this;
      }

      var dispose;

      if (!refs.length) return {
        dispose: function() {},
        trigger: now
      };

      if (refs.length === 1) {
        dispose = view.watch(refs[0], now).dispose;
      } else {

        var bindings = [];

        for (var i = refs.length; i--;) {
          bindings.push(view.watch(refs[i], now));
        }

        dispose = function() {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        };
      }

      return {
        dispose: dispose,
        trigger: function() {
          now();
          return this;
        }
      };
    }
  };
}

/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript(values, view) {

  var scripts = values.filter(function(value) {
    return typeof value !== "string";
  }).map(function(script) {
    return script;
  });

  function evaluate(view) {
    return values.map(function(script) {

      if (typeof script === "string") {
        return script;
      }

      return script.run.call(view);

    }).join("");
  }

  return {
    buffered: true,
    evaluate: function(view) {
      return evaluate(view);
    },
    watch: function(view, listener) {

      var bindings = [];

      function now() {
        listener(evaluate(view));
        return this;
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(view.watch(ref, now));
        }
      }

      return {
        trigger: now,
        dispose: function() {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      };
    }
  };
}

/**
 */

function staticScript(value, view) {
  return {
    watch: function(view, listener) {
      return {
        trigger: function() {
          listener(value);
          return this;
        },
        dispose: function() {

        }
      };
    }
  };
}

/**
 */

module.exports = function(value) {

  if (typeof value !== "object") return staticScript(value);
  if (value.length) {
    if (value.length === 1) return boundScript(value[0].value);
    return bufferedScript(value.map(function(v) {
      if (typeof v === "object") return v.value;
      return v;
    }));
  } else {
    return boundScript(value);
  }
};
