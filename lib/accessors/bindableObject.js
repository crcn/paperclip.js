var BaseAccessor   = require("./base"),
BindableOject      = require("bindable-object"),
BindableCollection = require("bindable-collection");

function BindableObjectAccessor () {

}

module.exports = BaseAccessor.extend(BindableObjectAccessor, {
  accessible: function (context) {
    return context && context.__isBindableObject;
  },
  cast: function (context) {
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
  deserializeCollection: function (collection) {
    return collection.source || collection;
  },
  deserializeObject: function (object) {
    return object.toJSON();
  }
});