var Base   = require("./base");

/**
 */

function ShowComponent() {
  Base.apply(this, arguments);
}

/**
 */

module.exports = Base.extend(ShowComponent, {

  /**
   */

  update: function() {
    var show = !!this.attributes.when;

    if (this._show === show) return;

    this._show = show;

    if (show) {
      this._view = this.childTemplate.view(this.view.context);
      this.section.appendChild(this._view.render());
    } else {

      if (this._view) {
        this._view.remove();
      }

      this._view = void 0;
    }
  }
});
