var BindableReference = require("./ref");

// TODO: refactor me

/**
 */

function createClip (view) {
  return {
    view: view,
    context: view.scope.context,
    get: function (path) {
      return this.view.get(path);
    },
    set: function (path, value) {
      return this.view.set(path, value);
    },
    bindTo: function (path, settable) {
      return new BindableReference(this, path, settable);
    },
    call: function (ctxPath, key, params) {


      // TODO - check for ctxPath undefined
      var ctx = ctxPath ? this.view.get(ctxPath) : this.view.scope.context;
      if (!ctx) return;
      var fn = ctx[key];
      if (fn) return fn.apply(ctx, params);
    }
  }
}

/**
 */

function boundScript (script) {

  var run = script.run, refs = script.refs;

  return {
    refs: refs,
    evaluate: function (view) {
      return run.call(createClip(view));
    },
    bind: function (view, listener) {

      var clip = createClip(view),
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
        var dispose = view.watch(refs[0], now).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(view.watch(refs[i], now));
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

function bufferedScript (values, view) {

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
    evaluate: function (view) { 
      return evaluate(createClip(view)); 
    },
    bind: function (view, listener) {

      var clip = createClip(view), bindings = [];

      function now () {
        listener(evaluate(clip));
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
        now: now,
        dispose: function ()  {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }
    }
  }
}

/**
 */

function staticScript (value, view) {
  return {
    bind: function (view, listener) {
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

/**
 */

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