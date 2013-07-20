var paperclip = require("../"),
templates = require("./templates"),
bindable = require("bindable"),
expect = require("expect.js");


describe("block value test", function() {


	describe("hello world writer", function() {

		var paper = paperclip.paper(templates.blockValue),
		writer,
		person = new bindable.Object({ name: { first: "Craig", last: "C" } });

		it("can render html", function() {
			writer = paper.load(person);
			expect(writer.toString()).to.be("hello Craig C!");
		});

		// sanity
		it("has not been bound", function() {
			person.set({ name: { first: "Josh", last: "L" } });
			expect(writer.toString()).to.be("hello Craig C!");
		});

		it("can be bound", function() {
			expect(writer.toString()).to.be("hello Josh L!");
			person.set("name.first", "Sam");
			expect(writer.toString()).to.be("hello Sam L!");
			person.set("name.last", "C");
			expect(writer.toString()).to.be("hello Sam C!");
		});


		it("can be unbound", function() {
			writer.unbind();
			person.set("name.first", "John");
			expect(writer.toString()).to.be("hello Sam C!");
		});

		/**
		 */

		it("can be re-bound", function() {
			writer.bind();
		});


		it("properly url encodes html entities", function() {
			person.set("name.first", "<div");
			expect(writer.toString()).to.be("hello &lt;div C!");
		});

	});


});