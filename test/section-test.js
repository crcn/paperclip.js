var paperclip = require("../"),
templates     = require("./templates"),
bindable      = require("bindable"),
expect        = require("expect.js");

describe("section test", function() {

  var paper = paperclip.paper(templates.sectionBinding),
  blockValuePaper = paperclip.paper(templates.blockValue),
  writer,
  pwriter,
  person = new bindable.Object({
    name: {
      first: "Craig",
      last: "C"
    }
  })
  sectionInfo = new bindable.Object({ 
    sections: {}
  });

  it("can display a section without anything in it", function() {
     writer = paper.bind(sectionInfo);
     expect(writer.toString()).to.be("A message to our nice friends: <!--block--> How nice was that!");
  });

  it("can fill in the section ", function() {
    sectionInfo.set("sections.blockValue", pwriter = blockValuePaper.bind(person));
    expect(writer.toString()).to.be("A message to our nice friends: hello Craig C! How nice was that!");
  });

  it("can replace the section with a string", function() {
    sectionInfo.set("sections.blockValue", "Hello World!");
    expect(writer.toString()).to.be("A message to our nice friends: Hello World! How nice was that!");
  });
});