var expect = require("expect.js"),
pc = require("../"),
Clip = pc.Clip,
compile = pc.compile;

describe("clip", function() {

  
  it("can create a simple clip", function() {

    var clip = new Clip({
      script: compile("person.name")
    });

    clip.data.set("person.name", "craig");
    expect(clip.value).to.be("craig");
    clip.data.set("person.name", "jake");
    expect(clip.value).to.be("jake");
  });

  it("can perform simple a computation", function() {
    var clip = new Clip({
      script: compile("person.age * 5")
    });
    clip.data.set("person.age", 5);
    expect(clip.value).to.be(25);
  });

  it("can perform a conditional statement", function() {

    var clip = new Clip({
      script: compile("person.name ? 'hello ' + person.name : 'person doesn\\'t exist'")
    });

    clip.data.set("person.name", "craig");
    expect(clip.value).to.be("hello craig");
    clip.data.set("person.name", undefined);
    expect(clip.value).to.be("person doesn't exist");
  });

  it("can perform one modifier", function() {

    var clip = new Clip({
      script: compile("person.name | uppercase()"),
      modifiers: {
        uppercase: function(value) { return String(value).toUpperCase() }
      }
    });

    clip.data.set("person.name", "craig")
    expect(clip.value).to.be("CRAIG")
  });

  it("can perform two modifiers", function() {
    var clip = new Clip({
      script: compile("person.name | uppercase() | append(', how are you??')"),
      modifiers: {
        uppercase: function(value) { return String(value).toUpperCase() },
        append: function(value, text) { return value + text }
      }
    });

    clip.data.set("person.name", "sam");
    expect(clip.value).to.be("SAM, how are you??")
  });

  it("can perform concatenation without a group", function() {
    var clip = new Clip({
      script: compile("person.name + ', how are you?' | uppercase()"),
      modifiers: {
        uppercase: function(value) { return String(value).toUpperCase() }
      }
    });
    clip.data.set("person.name", "monica");
    expect(clip.value).to.be("monica, HOW ARE YOU?")
    clip.data.set("person.name", "chris");
    expect(clip.value).to.be("chris, HOW ARE YOU?")
  });


  it("can perform concatenation within a group", function() {
    var clip = new Clip({
      script: compile("(person.name + ', how are you?') | uppercase()"),
      modifiers: {
        uppercase: function(value) { return String(value).toUpperCase() }
      }
    });
    clip.data.set("person.name", "monica");
    expect(clip.value).to.be("MONICA, HOW ARE YOU?")
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
    expect(clip.value).to.be("craig, checking id..., you can enter the bar")

    clip.data.set("person.name", "sarah");
    clip.data.set("person.age", 20);
    expect(clip.value).to.be("sarah, checking id..., you're too young!")

    clip.data.set("person.name", "craig");
    clip.data.set("person.forgotId", true);
    clip.data.set("person.age", 23);
    expect(clip.value).to.be("craig, checking id..., you're too young!")
  });

})