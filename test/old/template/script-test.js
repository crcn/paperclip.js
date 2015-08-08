var pc   = require("../../.."),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

// TODO - clean me up!

describe(__filename + "#", function () {

  describe("preserved words", function () {

    it("can return an undefined value", function () {
      assert.equal(pc.template("{{undefined}}").view({undefined:"abba"}).toString(), "undefined");
    });

    it("can return an null value", function () {
      assert.equal(pc.template("{{null}}").view({null:"abba"}).toString(), "null");
    });

    it("can return false", function () {
      assert.equal(pc.template("{{false}}").view({false:"abba"}).toString(), "false");
    });

    it("can return true", function () {
      assert.equal(pc.template("{{true}}").view({true:"abba"}).toString(), "true");
    });
  });

  describe("references", function () {
    it("can return a reference with no path", function () {
      assert.equal(pc.template("{{name}}").view({name:"frank"}).toString(), "frank");
    });

    it("can contain paths", function () {
      assert.equal(pc.template("{{name.first}}").view({name:{first:"frank"}}).toString(), "frank");
    });

    it("doesn't break if the path doesn't exist", function () {
      assert.equal(pc.template("{{name.first}}").view().toString(), "");
    });

    it("can return an alternative value if a ref doesn't exist", function () {
      var v = pc.template("{{name.first || 'doesn\\'t exist!' }}").view({});
      assert.equal(stringifyView(v), "doesn't exist!");
    });

    it("can call a function", function () {
      assert.equal(pc.template("{{hello()}}").view({ hello: function () {
        return "world!";
      }}).toString(), "world!");
    });

    it("can call a nested function", function () {
      assert.equal(pc.template("{{a.b.hello()}}").view({ a: { b: { hello: function () {
        return "world!";
      }}}}).toString(), "world!");
    });

    it("can call a function that doesn't exist", function () {
      assert.equal(pc.template("{{hello()}}").view().toString(), "");
    });

    it("can call a can assign to a nested value function that doesn't exist", function () {
      assert.equal(pc.template("{{a.b.hello()}}").view().toString(), "");
    });

    it("can call a function with one param", function () {
      assert.equal(pc.template("{{hello('bob')}}").view({ hello: function (name) {
        return "hello " + name;
      }}).toString(), "hello bob");
    });

    it("can call a function with a comparison operator", function () {
      assert.equal(pc.template("{{hello() === 'world'}}").view({
        hello: function () {
          return "world";
        }
      }).toString(), "true");
    });
  });


  describe("comparison operators", function () {
    it("can check that name == name", function () {
      assert.equal(pc.template("{{name==name}}").view({name:"frank"}).toString(), "true");
    });

    it("can check that name === name", function () {
      assert.equal(pc.template("{{name===name}}").view({name:"frank"}).toString(), "true");
    });

    it("can check that name !== false", function () {
      assert.equal(pc.template("{{name!==false}}").view({name:"frank"}).toString(), "true");
    });

    it("can return false || true", function () {
      assert.equal(pc.template("{{false||true}}").view({}).toString(), "true");
    });

    it("can return true && true", function () {
      assert.equal(pc.template("{{true&&true}}").view({}).toString(), "true");
    });

    it("can return true && false", function () {
      assert.equal(pc.template("{{true&&false}}").view({}).toString(), "false");
    });

    it("can check that 10 > 9 === true", function () {
      assert.equal(pc.template("{{10>9===true}}").view({}).toString(), "true");
    });

    it("can cast !!name as a boolean", function () {
      assert.equal(pc.template("{{!!name}}").view({name:"craig"}).toString(), "true");
      assert.equal(pc.template("{{!!name}}").view({}).toString(), "false");
    });

    it("can check that 10 > 10 === false", function () {
      assert.equal(pc.template("{{10>10}}").view({}).toString(), "false");
    });

    it("can check that 10 >= 10 === false", function () {
      assert.equal(pc.template("{{10>=10===true}}").view({}).toString(), "true");
    });

    it("can check that 10 < 10 === false", function () {
      assert.equal(pc.template("{{10<10}}").view({}).toString(), "false");
    });

    it("can check that 10 <= 10 === true", function () {
      assert.equal(pc.template("{{10<=10===true}}").view({}).toString(), "true");
    });

    it("can check that hello() === 'world!'", function () {
      assert.equal(pc.template("{{hello() === 'world!'}}").view({ hello: function () {
        return "world!"
      }}).toString(), "true");
    });

  });

  describe("strings", function () {
    it("can be concatenated", function () {
      assert.equal(pc.template('{{fn+" "+ln}}').view({fn:"a",ln:"b"}).toString(), "a b");
      assert.equal(pc.template('{{fn+ln}}').view({fn:"a",ln:"b"}).toString(), "ab");
    });

    it("can be defined", function () {
      assert.equal(pc.template('{{"abba"}}').view({}).toString(), "abba");
    })
  });

  describe("numbers", function () {

    it("can add two numbers together", function() {
      assert.equal(pc.template("{{5+2}}").view({}).toString(), "7");
    });

    it("can add two refs together", function() {
      assert.equal(pc.template("{{a+b}}").view({a:5,b:2}).toString(), "7");
    });

    it("can be multiplied", function() {
      assert.equal(pc.template("{{2*2}}").view({}).toString(), "4");
    });

    it("can be divided", function() {
      assert.equal(pc.template("{{10/2}}").view({}).toString(), "5");
    });

    it("can use decimal values", function() {
      assert.equal(pc.template("{{10+0.1}}").view({}).toString(), "10.1");
    });

    it("can use negative values", function() {
      assert.equal(pc.template("{{10+-1}}").view({}).toString(), "9");
    });

    it("can cast a ref as a negative value", function () {
      assert.equal(pc.template("{{-a}}").view({a:5}).toString(), "-5");
    });

    // breaks
    if(false)
    it("can subtract a negative value", function () {
      assert.equal(pc.template("{{5 - -4}}").view({}).toString(), "9");
    });

    it("can be concatenated on a string", function () {
      assert.equal(pc.template("{{100+'%'}}").view({}).toString(), "100%");
    });
  });

  describe("assigning", function () {

    var c;
    beforeEach(function () {
      c = {};
    })

    xit("can assign a=true", function () {
      assert.equal(pc.template("{{a=true}}").view(c).toString(), "true");
      assert.equal(c.a, true);
    });

    xit("can assign to a nested value", function () {
      assert.equal(pc.template("{{a.b.c.d=!e}}").view(c).toString(), "true");
      assert.equal(c.a.b.c.d, true);
    });

    xit("can assign aa.a=a=b=c=d", function () {
      var c = {d:1};
      var v = pc.template("{{aa.a=a=b=c=d}}").view(c);
      v.render();
      assert.equal(v.get("aa.a"), 1);
      assert.equal(v.get("a"), 1);
      assert.equal(v.get("b"), 1);
      assert.equal(v.get("c"), 1);
      assert.equal(v.get("d"), 1);

      v.set("c", 2);
      // v.runner.update();

      // triggers re-evaluation. All values should STILL be 1
      assert.equal(v.get("c"), 1);

      v.set("d", 2);
      // v.runner.update();
      assert.equal(v.get("aa.a"), 2);
      assert.equal(v.get("a"), 2);
      assert.equal(v.get("b"), 2);
      assert.equal(v.get("c"), 2);
      assert.equal(v.get("d"), 2);
    });
  });
});
