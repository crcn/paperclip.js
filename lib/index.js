var Application = require("mojo-application"),
template        = require("./template");

module.exports = function (app) {

  if (!app) app = Application.main;
  if (app.paperlip) return app.paperlip;

  var _modifiers = {};

  return app.paperclip = {

    /**
     */

    modifiers: _modifiers,

    /**
     */

    modifier: function (name, modifier) {
      _modifiers[name] = modifier;
    },

    /**
     */

    template: function (source, rapp) {
      return new template(source, rapp || app);
    }
  };
}


var pc = module.exports();

for (var key in pc) {
  module.exports[key] = pc[key];
}

