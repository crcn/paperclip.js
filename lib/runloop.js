var protoclass = require("protoclass");

var rAF = (global.requestAnimationFrame     ||
          global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame    || 
          process.nextTick).bind(global);

if (process.browser) {
  var defaultTick = function (next) {
    rAF(next);
  }
} else {
  var defaultTick = function (next) {
    next();
  }
}

/**
 */

function RunLoop (options) {
  this._animationQueue = [];
  this.tick = options.tick || defaultTick;
}

protoclass(RunLoop, {

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  deferOnce: function (context) {

    if (context.__running) return;
    context.__running = true;

    // push on the animatable object
    this._animationQueue.push(context);

    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    // run the animation frame, and callback all the animatable objects
    this.tick(function () {
      self.runNow();
      self._requestingFrame = false;
    });
  },

  /**
   */

  runNow: function () {
    if (!this._requestingFrame) return;
    var queue = this._animationQueue;
    this._animationQueue = [];

    // queue.length is important here, because animate() can be
    // called again immediately after an update
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      item.__running = false;
      item.update();

      // check for anymore animations - need to run
      // them in order
      if (this._animationQueue.length) {
        this.runNow();
      }
    }
  }
});

module.exports = RunLoop;