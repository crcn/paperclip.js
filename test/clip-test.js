var expect = require("expect.js"),
pc = require("../"),
Clip = pc.Clip,
compile = Clip.compile;

describe("clip", function() {
  

  it("can bind to a single value", function() {
    var clip = new Clip({
      script: compile("name")
    });
    clip.data.set("name", "craig");
    expect(clip.get("value")).to.be("craig")
  });


  it("can cast a value as another", function() {
    var clip = new Clip({
      script: compile("names as name")
    });

  })

  
  it("can create a simple clip", function() {

    var clip = new Clip({
      script: compile("person.name")
    });

    clip.data.set("person.name", "craig");
    expect(clip.get("value")).to.be("craig");
    clip.data.set("person.name", "jake");
    expect(clip.get("value")).to.be("jake");
  });


  it("can perform simple a computation", function() {
    var clip = new Clip({
      script: compile("person.age * 5")
    });
    clip.data.set("person.age", 5);
    expect(clip.get("value")).to.be(25);
  });


  it("doesn't screw up groups", function() {
    var clip = new Clip({
      script: compile("(5+5) * 3")
    });
    expect(clip.get("value")).to.be(30)
  });

  it("can perform a conditional statement", function() {

    var clip = new Clip({
      script: compile("person.name ? 'hello ' + person.name : 'person doesn\\'t exist'")
    });

    clip.data.set("person.name", "craig");
    expect(clip.get("value")).to.be("hello craig");
    clip.data.set("person.name", undefined);
    expect(clip.get("value")).to.be("person doesn't exist");
  });

  it("can perform one modifier", function() {

    var clip = new Clip({
      script: compile("person.name | uppercase()"),
    });

    clip.data.set("person.name", "craig")
    expect(clip.get("value")).to.be("CRAIG")
  });

  it("can use an OR operator", function() {
    var clip = new Clip({
      script: compile("person.age || 0")
    });

    expect(clip.get("value")).to.be(0)
    clip.data.set("person.age", 99);
    expect(clip.get("value")).to.be(99);
  })

  it("can perform two modifiers", function() {
    var clip = new Clip({
      script: compile("person.name | uppercase() | append(', how are you??')"),
      modifiers: {
        append: function(value, text) { return value + text }
      }
    });

    clip.data.set("person.name", "sam");
    expect(clip.get("value")).to.be("SAM, how are you??")
  });

  it("can perform concatenation without a group", function() {
    var clip = new Clip({
      script: compile("person.name + ', how are you?' | uppercase()")
    });
    clip.data.set("person.name", "monica");
    expect(clip.get("value")).to.be("monica, HOW ARE YOU?")
    clip.data.set("person.name", "chris");
    expect(clip.get("value")).to.be("chris, HOW ARE YOU?")
  });


  it("can perform concatenation within a group", function() {
    var clip = new Clip({
      script: compile("(person.name + ', how are you?') | uppercase()")
    });
    clip.data.set("person.name", "monica");
    expect(clip.get("value")).to.be("MONICA, HOW ARE YOU?")
  });


  it("can perform a modifier within a modifier", function() {
    var clip = new Clip({
      script: compile("(person.name + ', checking id...') | canEnterBar(person.age | greaterThan(21) && person.forgotId != true)"),
      modifiers: {
        canEnterBar: function(value, can) { return can ? value + ", you can enter the bar" : value + ", you're too young!" },
        greaterThan: function (value, age) { return value > age }
      }
    });

    clip.data.set("person.name", "craig");
    clip.data.set("person.age", 23);
    expect(clip.get("value")).to.be("craig, checking id..., you can enter the bar")

    clip.data.set("person.name", "sarah");
    clip.data.set("person.age", 20);
    expect(clip.get("value")).to.be("sarah, checking id..., you're too young!")

    clip.data.set("person.name", "craig");
    clip.data.set("person.forgotId", true);
    clip.data.set("person.age", 23);
    expect(clip.get("value")).to.be("craig, checking id..., you're too young!")
  });


  it("can bind a value to clip", function() {
    var clip = new Clip({
      script: compile("upperName: person.name | uppercase()")
    });


    var uname;

    clip.bind("upperName", function(name) {
      uname = name;
    })

    clip.data.set("person.name", "craig");
    expect(uname).to.be("CRAIG");
  });


  it("can recursively change a value", function() {
    var clip = new Clip({
      script: compile("@value | increment(5)"),
      modifiers: {
          increment: function(value, until) {
            if(typeof value == "undefined") return 0;
            return value == until ? value : value + 1
          }
      }
    });

    expect(clip.get("value")).to.be(5);
  });
})