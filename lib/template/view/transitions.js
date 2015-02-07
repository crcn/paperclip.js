var protoclass = require("protoclass");
var async      = require("../../utils/async");

/**
 */

function Transitions() {
  this._enter = [];
  this._exit  = [];
}

/**
 */

module.exports = protoclass(Transitions, {

  /**
   */

  push: function(transition) {
    if (transition.enter) this._enter.push(transition);
    if (transition.exit) this._exit.push(transition);
  },

  /**
   */

  enter: function() {
    if (!this._enter.length) return false;
    for (var i = 0, n = this._enter.length; i < n; i++) {
      this._enter[i].enter();
    }
  },

  /**
   */

  exit: function(complete) {
    if (!this._exit.length) return false;
    var self = this;
    process.nextTick(function() {
      async.each(self._exit, function(transition, next) {
        transition.exit(next);
      }, complete);
    });

    return true;
  }
});
