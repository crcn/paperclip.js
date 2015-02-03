var BindableReference = require("./ref");

/**
 */

function createClip (scope) {
  return {
    scope: scope,
    context: scope.context,
    get: function (path) {
      return this.scope.get(path);
    },
    set: function (path, value) {
      return this.scope.set(path, value);
    },
    bindTo: function (path, settable) {
      return new BindableReference(this, path, settable);
    },
    call: function (ctxPath, key, params) {


      // TODO - check for ctxPath undefined
      var ctx = ctxPath ? this.scope.get(ctxPath) : this.scope.context;
      if (!ctx) return;
      var fn = ctx[key];
      if (fn) return fn.apply(ctx, params);
    }
  }
}



function boundScript (script) {

  var run = script.run, refs = script.refs;

  return {
    refs: refs,
    evaluate: function (scope) {
      return run.call(createClip(scope));
    },
    bind: function (scope, listener) {

      var clip = createClip(scope),
      currentValue,
      locked = false;

      function now () {
        if (locked) return;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(clip), oldValue);
        locked = false;
      }

      var dispose;

      if (!refs.length) return {
        dispose: function () {},
        now: now
      };

      if (refs.length === 1) {
        var dispose = scope.watch(refs[0], now).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(scope.watch(refs[i], now));
        }

        dispose = function () {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }

      return {
        dispose: dispose,
        now: function () {
          now();
          return this;
        }
      }
    }
  };
};


/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript (values, scope) {

  var scripts = values.filter(function (value) {
    return typeof value !== "string";
  }).map(function (script) {
    return script;
  });

  function evaluate (clip) {
    return values.map(function (script) {

      if (typeof script === "string") {
        return script;
      }

      return script.run.call(clip);

    }).join("");
  }

  return {
    buffered: true,
    evaluate: function (scope) { 
      return evaluate(createClip(scope)); 
    },
    bind: function (scope, listener) {

      var clip = createClip(scope), bindings = [];

      function now () {
        listener(evaluate(clip));
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(scope.watch(ref, now));
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

function staticScript (value, scope) {
  return {
    bind: function (scope, listener) {
      return {
        now: function () {
          listener(value);
        },
        dispose: function () {

        }
      }
    }
  }
}


module.exports = function (value) {

  if (typeof value !== "object") return staticScript(value);
  if (value.length) {
    if (value.length === 1) return boundScript(value[0].value);
    return bufferedScript(value.map(function (v) {
      if (typeof v === "object") return v.value;
      return v;
    }));
  } else {
    return boundScript(value);
  }
}