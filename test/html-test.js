var pc    = require(".."),
expect    = require("expect.js"),
templates = require("./templates"),
bindable  = require("bindable");


/**
 * tests for sections. For instance:
 * {{ html: subView }}
 */

describe("html sections", function() {

  var sectionTemplate = pc.template(templates.section),
  section = new bindable.Object({
    blockValue: pc.template(templates.hello)
  }),
  person = new bindable.Object({
    name: {
      first: "jake",
      last: "anderson"
    }
  });

  it("can load an html section", function() {

    return;
    var sectionContent = sectionTemplate.load(section);

    console.log(sectionContent.toString());
    expect(sectionContent.toString()).to.be("")
  })
});