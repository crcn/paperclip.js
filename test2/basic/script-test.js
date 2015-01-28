var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
Application  = require("mojo-application");

var apc = Application.main.paperclip;

describe(__filename + "#", function () {
  
  describe("preserved words", function () {

    it("can return an undefined value", function () {
      expect(pc.template("{{undefined}}").bind({undefined:"abba"}).render().toString()).to.be("");
    });

    it("can return an null value", function () {
      expect(pc.template("{{null}}").bind({null:"abba"}).render().toString()).to.be("");
    });

    it("can return false", function () {
      expect(pc.template("{{false}}").bind({false:"abba"}).render().toString()).to.be("false");
    });

    it("can return true", function () {
      expect(pc.template("{{true}}").bind({true:"abba"}).render().toString()).to.be("true");
    });
  });

  describe("references", function () {
    it("can return a reference with no path", function () {
      expect(pc.template("{{name}}").bind({name:"frank"}).render().toString()).to.be("frank");
    });

    it("can contain paths", function () {
      expect(pc.template("{{name.first}}").bind({name:{first:"frank"}}).render().toString()).to.be("frank");
    });

    it("doesn't break if the path doesn't exist", function () {
      expect(pc.template("{{name.first}}").bind().render().toString()).to.be("");
    });

    it("dcan return an alternative value if a ref doesn't exist", function () {
      expect(pc.template("{{name.first || 'doesn\\'t exist!' }}").bind().render().toString()).to.be("doesn&#x27;t exist!");
    });

    it("can call a function", function () {
      expect(pc.template("{{hello()}}").bind({ hello: function () {
        return "world!";
      }}).render().toString()).to.be("world!");
    });

    it("can call a nested function", function () {
      expect(pc.template("{{a.b.hello()}}").bind({ a: { b: { hello: function () {
        return "world!";
      }}}}).render().toString()).to.be("world!");
    });

    it("can call a function that doesn't exist", function () {
      expect(pc.template("{{hello()}}").bind().render().toString()).to.be("");
    });

    it("can call a can assign to a nested value function that doesn't exist", function () {
      expect(pc.template("{{a.b.hello()}}").bind().render().toString()).to.be("");
    });

    it("can call a function with one param", function () {
      expect(pc.template("{{hello('bob')}}").bind({ hello: function (name) {
        return "hello " + name;
      }}).render().toString()).to.be("hello bob");
    });

    it("can call a function with a comparison operator", function () {
      expect(pc.template("{{hello() === 'world'}}").bind({
        hello: function () {
          return "world";
        }
      }).render().toString()).to.be("true");
    });
  });


  describe("comparison operators", function () {
    it("can check that name == name", function () {
      expect(pc.template("{{name==name}}").bind({name:"frank"}).render().toString()).to.be("true");
    });

    it("can check that name === name", function () {
      expect(pc.template("{{name===name}}").bind({name:"frank"}).render().toString()).to.be("true");
    });

    it("can check that name !== false", function () {
      expect(pc.template("{{name!==false}}").bind({name:"frank"}).render().toString()).to.be("true");
    });

    it("can return false || true", function () {
      expect(pc.template("{{false||true}}").bind().render().toString()).to.be("true");
    });

    it("can return true && true", function () {
      expect(pc.template("{{true&&true}}").bind().render().toString()).to.be("true");
    });

    it("can return true && false", function () {
      expect(pc.template("{{true&&false}}").bind().render().toString()).to.be("false");
    });

    it("can check that 10 > 9 === true", function () {
      expect(pc.template("{{10>9===true}}").bind().render().toString()).to.be("true");
    });

    it("can cast !!name as a boolean", function () {
      expect(pc.template("{{!!name}}").bind({name:"craig"}).render().toString()).to.be("true");
      expect(pc.template("{{!!name}}").bind().render().toString()).to.be("false");
    });

    it("can check that 10 > 10 === false", function () {
      expect(pc.template("{{10>10}}").bind().render().toString()).to.be("false");
    });

    it("can check that 10 >= 10 === false", function () {
      expect(pc.template("{{10>=10===true}}").bind().render().toString()).to.be("true");
    });

    it("can check that 10 < 10 === false", function () {
      expect(pc.template("{{10<10}}").bind().render().toString()).to.be("false");
    });

    it("can check that 10 <= 10 === true", function () {
      expect(pc.template("{{10<=10===true}}").bind().render().toString()).to.be("true");
    });

    it("can check that hello() === 'world!'", function () {
      expect(pc.template("{{hello() === 'world!'}}").bind({ hello: function () {
        return "world!"
      }}).render().toString()).to.be("true");
    });

  });

  describe("strings", function () {
    it("can be concatenated", function () {
      expect(pc.template('{{fn+" "+ln}}').bind({fn:"a",ln:"b"}).render().toString()).to.be("a b");
      expect(pc.template('{{fn+ln}}').bind({fn:"a",ln:"b"}).render().toString()).to.be("ab");
    });

    it("can be defined", function () {
      expect(pc.template('{{"abba"}}').bind().render().toString()).to.be("abba");
    })
  });

  describe("numbers", function () {

    it("can add two numbers together", function() {
      expect(pc.template("{{5+2}}").bind().render().toString()).to.be("7");
    });

    it("can add two refs together", function() {
      expect(pc.template("{{a+b}}").bind({a:5,b:2}).render().toString()).to.be("7");
    });

    it("can be multiplied", function() {
      expect(pc.template("{{2*2}}").bind({}).render().toString()).to.be("4");
    });

    it("can be divided", function() {
      expect(pc.template("{{10/2}}").bind({}).render().toString()).to.be("5");
    });

    it("can use decimal values", function() {
      expect(pc.template("{{10+0.1}}").bind({}).render().toString()).to.be("10.1");
    });

    it("can use negative values", function() {
      expect(pc.template("{{10+-1}}").bind({}).render().toString()).to.be("9");
    });

    it("can cast a ref as a negative value", function () {
      expect(pc.template("{{-a}}").bind({a:5}).render().toString()).to.be("-5");
    });

    // breaks
    if(false)
    it("can subtract a negative value", function () {
      expect(pc.template("{{5 - -4}}").bind().render().toString()).to.be("9");
    });

    it("can be concatenated on a string", function () {
      expect(pc.template("{{100+'%'}}").bind().render().toString()).to.be("100%");
    });
  });

  describe("assigning", function () {

    var c;
    beforeEach(function () {
      c = new BindableObject();
    })

    it("can assign a=true", function () {
      expect(pc.template("{{a=true}}").bind(c).render().toString()).to.be("true");
      expect(c.get("a")).to.be(true);
    });

    it("can assign to a nested value", function () {
      expect(pc.template("{{a.b.c.d=!e}}").bind(c).render().toString()).to.be("true");
      expect(c.get("a.b.c.d")).to.be(true);
    });

    it("can assign aa.a=a=b=c=d", function () {
      var c = new BindableObject({d:1});
      pc.template("{{aa.a=a=b=c=d}}").bind(c).render();
      expect(c.get("aa.a")).to.be(1);
      expect(c.get("a")).to.be(1);
      expect(c.get("b")).to.be(1);
      expect(c.get("c")).to.be(1);
      expect(c.get("d")).to.be(1);
      c.set("c", 2);

      // triggers re-evaluation. All values should STILL be 1
      expect(c.get("c")).to.be(1);

      c.set("d", 2);
      expect(c.get("aa.a")).to.be(2);
      expect(c.get("a")).to.be(2);
      expect(c.get("b")).to.be(2);
      expect(c.get("c")).to.be(2);
      expect(c.get("d")).to.be(2);
    });
  });

  describe("binding operators", function () {

    it("can ignore a reference with ~", function () {
      var c = new BindableObject({
        a: "a"
      }), t = pc.template("{{~a}}").bind(c);
      expect(t.render().toString()).to.be("a");
      c.set("a", "b");
      expect(t.render().toString()).to.be("a");
    });

    xit("can ignore a reference with ticks", function () {

      var c = new BindableObject({
        a: "a"
      }), t = pc.template("{{`a`}}").bind(c);
      expect(t.render().toString()).to.be("a");
      c.set("a", "b");
      expect(t.render().toString()).to.be("a");
    });

    it("<~ can bind a reference, but not be settable", function () {
      var c = new BindableObject({
        a: "a"
      }), t = pc.template("{{<~a}}").bind(c);
      expect(t.render().toString()).to.be("a");
      c.set("a", "b");
      expect(t.render().toString()).to.be("b");
      var ref = t.clips._clips[0].script.evaluate(t.context);

      expect(ref.__isBindableReference).to.be(true);
      ref.value("baab");
      expect(ref.value()).to.be("b");
    });

    it("drops ~> refs from being watched, but casts them s a bindable ref", function () {
      var c = new BindableObject({
        a: "a"
      }), t = pc.template("{{~>a}}").bind(c);
      expect(t.render().toString()).to.be("a");
      var ref = t.clips._clips[0].script.evaluate(t.context);

      expect(t.clips._clips[0].script.refs.length).to.be(0);
      expect(ref.__isBindableReference).to.be(true);
      ref.value("b");
      expect(t.render().toString()).to.be("a");
    });

    it("can use a data-binding with an or statement", function () {
      var c = new BindableObject();
      pc.template("{{a||<~>a}}").bind(c);
      pc.template("{{a||~a}}").bind(c);
      pc.template("{{a||<~a}}").bind(c);
      pc.template("{{a||~>a}}").bind(c);
    });

    it("allows for references with <~> to be bound both ways", function () {
      var c = new BindableObject({
        a: "a"
      }), t = pc.template("{{<~>a}}").bind(c);
      expect(t.render().toString()).to.be("a");
      var ref = t.clips._clips[0].script.evaluate(t.context);
      expect(t.clips._clips[0].script.refs.length).to.be(1);
      expect(ref.__isBindableReference).to.be(true);
      expect(ref.value()).to.be("a");
      ref.value("b");
      expect(t.render().toString()).to.be("b");
    });
  });
});
