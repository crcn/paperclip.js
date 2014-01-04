var protoclass = require("protoclass"),
nofactor       = require("nofactor");

function PaperclipApplication () {
  this.nodeFactory = nofactor["default"];
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

      for (var i = self._animationQueue.length; i--;) {
        var animatable = self._animationQueue[i];
        animatable.update();
      }

      self._animationQueue = [];
    });
  }
});

module.exports = PaperclipApplication;