/**
 */

function View(section, template, options) {
  this.section  = section;
  this.bindings = [];
  this.template = template;
  this.options  = options;
}

/**
 * updates the view
 */

View.prototype.update = function() {
  for (var i = 0, n = this.bindings.length; i < n; i++) {
    this.bindings[i].update();
  }
};

/**
 */

View.prototype.render = function() {
  return this.section.render();
};

/**
 */

View.prototype.remove = function() {
  return this.section.remove();
};

/**
 */

module.exports = View;
