module.exports = {

  /**
   */
   
  each: function(items, each, complete) {
    var total = items.length,
    completed = 0;
    items.forEach(function(item) {
      var called = false;
      each(item, function() {
        if (called) throw new Error("callback called twice");
        called = true;
        if (++completed === total && complete) complete();
      });
    });
  }
}