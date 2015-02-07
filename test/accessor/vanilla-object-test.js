var expect     = require("expect.js"),
pc             = require("../..")
template       = pc.template,
stringifyView  = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  var accessor;
  beforeEach(function () {
    accessor = {

      /**
       */

      _getters: {},

      /**
       */

      _setters: {},

      /**
       */

      _watchers: [],

      /**
       */

      castObject: function (object) { return object; },

      /**
       */

      call: function (context, path, params) {

        var fnName = path.pop(),
        fnCtx      = path.length ? this.get(object, path) : context;

        if (!fnCtx) return;
        return fnCtx[fnName].call(fnCtx, params);
      },

      /**
       */

      get: function (object, path) {

        var pt = path.join("."), getter;
        if (!(getter = this._getters[pt])) {
          getter = this._getters[pt] = new Function("return this." +pt);
        }

        // is undefined - fugly, but works for this test.
        try {
          return getter.call(object);
        } catch (e) {
          return void 0;
        }
      },

      /**
       */

      set: function (object, path, value) {
        var pt = path.join("."), setter;
        if (!(setter = this._setters[pt])) {
          setter = this._setters[pt] = new Function("value", "return this." +pt+"=value");
        }

        var ret;
        // is undefined - fugly, but works for this test.
        try {
          ret = setter.call(object, value);
        } catch (e) {
          return void 0;
        }

        this.apply();

        return ret;
      },

      /**
       */

      watchProperty: function (object, path, listener) {
        
        var self = this;
        var watcher = {
          context: object,
          apply: function () {
            var newValue = self.get(object, path);
            if (newValue === this.currentValue && typeof newValue !== "function") return;
            var oldValue = this.currentValue;
            this.currentValue = newValue;
            listener(newValue, this.currentValue);
          }
        };
        
        this._watchers.push(watcher);
        
        return {
          trigger: function(){
            watcher.apply();
          },
          dispose: function () {
            var i = self._watchers.indexOf(watcher);
            if (~i) self._watchers.splice(i, 1);
          }
        }
      },

      /**
       */

      watchEvent: function (object, event, listener) {
        // do nothing
        return {
          dispose: function(){}
        }
      },

      /**
       * TODO - deserialize is improper. Maybe use
       * 
       */

      deserializeCollection: function (collection) {
        return collection;
      },

      /**
       */

      deserializeObject: function (object) {
        return object;
      },

      /**
       */

      apply: function () {
        for (var i = 0, n = this._watchers.length; i < n; i++) {
          this._watchers[i].apply();
        }
      }
    };
  });

  it("can create a controller that accesses properties from a vanilla object", function () {

  
    var tpl = pc.template("{{a}} {{a2.b2}}", {
      accessor: accessor
    });

    var context = {
      a: "a",
      a2: {
        b2: "b"
      }
    }



    var v = tpl.view(context);

    expect(stringifyView(v)).to.be("a\u00A0b");

    // woo for vanilla objects!
    context.a = "b";
    context.a2.b2 = "c";

    accessor.apply();

    v.runloop.runNow();
    expect(stringifyView(v)).to.be("b\u00A0c");

  });

  it("properly access properties on the context of the view controller if ^", function () {
    var t = pc.template("{{^a}}", { accessor: accessor });
    var c = { a: 1 };
    var v = t.view(c);
    expect(stringifyView(v)).to.be("1");
    c.a = 2;
    accessor.apply();
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("2");
  });
});