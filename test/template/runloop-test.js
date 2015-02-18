var expect  = require("expect.js"),
RunLoop     = require("../../lib/runloop");

describe(__filename + "#", function () {

  var runloop;

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
    expect(i).to.be(1);
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
      expect(i).to.be.greaterThan(10);
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
          expect(i).to.be(1);
          runloop.deferOnce({
            update: function () {
              i++;
              expect(i).to.be(2);
            }
          })
        }
      });

      runloop.deferOnce({
        update: function () {
          i++;
          expect(i).to.be(3);
        }
      });

      setTimeout(function () {
        expect(i).to.be(3);
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
    expect(i).to.be(5);


    setTimeout(function () {
      expect(i).to.be(5);
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
    expect(i).to.be(0);
    runloop.deferOnce(runnable);
    expect(i).to.be(0);
    runloop.runNow();

    expect(i).to.be(1);

    runloop.deferOnce(runnable);
    runloop.runNow();

    expect(i).to.be(2);
  });

});