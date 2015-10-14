var assert  = require("assert"),
RunLoop     = require("../..//lib/runloop");

describe(__filename + "#", function () {

  var runloop;

  return; // TODO

  beforeEach(function () {
    runloop = new RunLoop({});
  });

  after(function () {
    process.browser = 0;
  })


  it("doesn't tick if process.browser is false", function () {

    var i = 0;
    runloop.deferOnce({ update: function () {
      i++;
    }});
    assert.equal(i, 1);
  });

  it("can recursively allow things to update themselves", function (next) {
    var i = 0;
    runloop.tick = function(tick) { return setTimeout(tick, 0); }
    var r = {
      update: function () {
        i++;
        if (i < 11)
        runloop.deferOnce(r);
      }
    }
    runloop.deferOnce(r);

    setTimeout(function () {
      assert.equal(i > 10, true);
      next();
    }, 100);
  });


  it("runs animations procedurally", function (next) {

      var i = 0;

      runloop.tick = function(tick) { return setTimeout(tick, 0); }

      process.browser = 1;
      runloop.deferOnce({
        update: function () {
          i++;
          assert.equal(i, 1);
          runloop.deferOnce({
            update: function () {
              i++;
              assert.equal(i, 2);
            }
          })
        }
      });

      runloop.deferOnce({
        update: function () {
          i++;
          assert.equal(i, 3);
        }
      });

      setTimeout(function () {
        assert.equal(i, 3);
        next();
      }, 10);
  });


  it("can update immediately", function (next) {
    var i = 0;

    for (var j = 5; j--;)
    runloop.deferOnce({
      update: function () {
        i++;
      }
    });

    runloop.runNow();
    assert.equal(i, 5);


    setTimeout(function () {
      assert.equal(i, 5);
      next();
    }, 10);
  });


  it("cannot re-run the same object", function () {
    var i = 0;
    var runnable = {
      update: function () { i++; }
    }

    runloop = new RunLoop({ tick: process.nextTick });

    runloop.deferOnce(runnable);
    assert.equal(i, 0);
    runloop.deferOnce(runnable);
    assert.equal(i, 0);
    runloop.runNow();

    assert.equal(i, 1);

    runloop.deferOnce(runnable);
    runloop.runNow();

    assert.equal(i, 2);
  });

});
