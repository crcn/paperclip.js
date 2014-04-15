var protoclass = require("protoclass"),
nofactor       = require("nofactor");

function PaperclipApplication (options) {
  if (!options) options = {};
  this.nodeFactory = options.nodeFactory || nofactor["default"];
  this._animationQueue = [];
}

protoclass(PaperclipApplication, {

  /**
   */

  animate: function (animatable) {

    if (!process.browser) {
      return animatable.update();
    }

    this._animationQueue.push(animatable);

    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    requestAnimationFrame(function () {

      for (var i = 0; i < self._animationQueue.length; i++) {
        self._animationQueue[i].update();
      }

      self._animationQueue = [];
      self._requestingFrame = false;
    });
  }
});

module.exports = PaperclipApplication;