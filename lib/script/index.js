var BindableReference = require("./ref");

/**
 */

function createClip (context) {
  return {
    context: context,
    get: function (path) {
      return this.context.get(path);
    },
    set: function (path, value) {
      return this.context.set(path, value);
    },
    bindTo: function (path, settable) {
      return new BindableReference(this, path, settable);
    },
    call: function (ctx, key, params) {

      var fn;

      if (!ctx) return;

      if (ctx.__isBindable) {
        fn = ctx.get(key);
        ctx = ctx;
      } else {
        fn = ctx[key];
      }

      if (fn) return fn.apply(ctx, params);
    }
  }
}

function wrapInRaf (cb, runner) {
  var updateable = { update: cb };
  return function () {
    runner.run(updateable);
  }
}


function boundScript (script) {

  var run = script.run, refs = script.refs;

  return {
    refs: refs,
    evaluate: function (context) {
      return run.call(createClip(context));
    },
    bind: function (runner, context, listener) {

      var clip = createClip(context),
      currentValue,
      locked = false;

      function now () {
        if (locked) return;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(clip), oldValue);
        locked = false;
      }

      var rafNow = wrapInRaf(now, runner);


      var dispose;

      if (!refs.length) return {
        dispose: function () {},
        now: now
      };

      if (refs.length === 1) {
        var dispose = context.bind(refs[0], rafNow).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(context.bind(refs[i], rafNow));
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

function bufferedScript (values, runner) {

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
    evaluate: function (context) { 
      return evaluate(createClip(context)); 
    },
    bind: function (runner, context, listener) {

      var clip = createClip(context), bindings = [];

      function now () {
        listener(evaluate(clip));
      }

      var rafNow = wrapInRaf(now, runner);

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(context.bind(ref, rafNow));
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

function staticScript (value, runner) {
  return {
    bind: function (context, listener) {
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