var protoclass = require("protoclass"),
async          = require("./utils/async");

/**
 * bindings specific to the view
 */

function Transitions (view) {
  this.view = view;
  this._enter = [];
  this._exit = [];
}

protoclass(Transitions, {

  /**
   */

  push: function (transition) {
    if (transition.enter) this._enter.push(transition);
    if (transition.exit) this._exit.push(transition);
  },

  /**
   */

  exit: function () {
    if (!this._exit.length) return this.view.section.remove();
    var self = this;
    async.each(this._exit, function (exit, next) {
      exit(next);
    }, function () {
      self.view.section.remove();
    });
  },

  /**
   */

  enter: function () {
    if (this._enter) {
      async.each(this._enter, function (enter, next) {
        enter(next);
      });
    }
  }
});

module.exports = Transitions;