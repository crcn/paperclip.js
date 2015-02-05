var BaseAccessor   = require("./base"),
BindableOject      = require("bindable-object"),
BindableCollection = require("bindable-collection");

function BindableObjectAccessor () {

}

module.exports = BaseAccessor.extend(BindableObjectAccessor, {
  accessible: function (context) {
    return context && context.__isBindableObject;
  },
  castObject: function (context) {
    if (context.__isBindable) return context;
    if (context.toString() === "[object Array]") return new BindableCollection(context);
    return new BindableOject(context);
  },
  castCollection: function (context) {
    if (context.__isBindable) return context;
    if (context.toString() === "[object Array]") return new BindableCollection(context);
    return new BindableOject(context);
  },
  get: function (context, path) {
    return context.get(path);
  },
  set: function (context, path, value) {
    return context.set(path, value);
  },
  call: function (context, path, params) {

    var fnPath = path.pop(),
    ctxPath    = path.length ? path : void 0;

    // TODO - check for ctxPath undefined
    var ctx = ctxPath ? context.get(ctxPath) : context;
    if (!ctx) return;
    var fn = ctx[fnPath];
    if (fn) return fn.apply(ctx, params);
  },
  watchProperty: function (context, path, listener) {
    return context.watch(path, listener);
  },
  watchEvent: function (context, event, value) {
    if (event === "change" && context.__isBindableCollection) {
      return context.on(event, value);
    }
    return {
      dispose: function(){}
    }
  },

  /**
   * TODO - deserialize is improper. Maybe use something like
   * normalize, toArray
   */

  normalizeCollection: function (collection) {
    return collection.source || collection;
  },
  normalizeObject: function (object) {
    return object.toJSON();
  }
});