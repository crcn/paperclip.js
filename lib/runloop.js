var protoclass = require("protoclass");

var rAF = (global.requestAnimationFrame      ||
          global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame    ||
          process.nextTick).bind(global);

/* istanbul ignore next */
if (process.browser) {
  var defaultTick = function(next) {
    rAF(next);
  };
} else {
  var defaultTick = function(next) {
    next();
  };
}

/**
 */

function RunLoop(options) {
  this._animationQueue = [];
  this.tick = options.tick || defaultTick;
  this._id = options._id || 2;
}

protoclass(RunLoop, {

  /**
   * child runloop in-case we get into recursive loops
   */

  child: function() {
    return this.__child || (this.__child = new RunLoop({ tick: this.tick, _id: this._id << 2 }));
  },

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  deferOnce: function(context) {

    if (!context.__running) context.__running = 1;

    if (context.__running & this._id) {
      if (this._running) {
        this.child().deferOnce(context);
      }
      return;
    }

    context.__running |= this._id;

    // push on the animatable object
    this._animationQueue.push(context);

    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    // run the animation frame, and callback all the animatable objects
    this.tick(function() {
      self.runNow();
      self._requestingFrame = false;
    });
  },

  /**
   */

  runNow: function() {
    var queue = this._animationQueue;
    this._animationQueue = [];
    this._running = true;

    // queue.length is important here, because animate() can be
    // called again immediately after an update
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      item.update();
      item.__running &= ~this._id;

      // check for anymore animations - need to run
      // them in order
      if (this._animationQueue.length) {
        this.runNow();
      }
    }

    this._running = false;
  }
});

module.exports = RunLoop;
