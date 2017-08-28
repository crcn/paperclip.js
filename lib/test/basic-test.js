"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const chai_1 = require("chai");
describe(__filename + "#", () => {
    it("can create a virtual element", () => {
        const div = index_1.element("div", null);
        chai_1.expect(div.tagName).to.eql("div");
    });
    it("can create a virtual element with children", () => {
        const div = index_1.element("div", null,
            "a",
            index_1.element("span", null, "b"));
        chai_1.expect(div.tagName).to.eql("div");
        chai_1.expect(div.children.length).to.eql(2);
        chai_1.expect(div.children[0].nodeType).to.eql(index_1.NodeTypes.TEXT);
        chai_1.expect(div.children[1].nodeType).to.eql(index_1.NodeTypes.ELEMENT);
    });
    it("can create a virtual element with children as an array", () => {
        const div = index_1.element("div", null, ['a', index_1.element("span", null, "b")]);
        chai_1.expect(div.tagName).to.eql("div");
        chai_1.expect(div.children.length).to.eql(2);
        chai_1.expect(div.children[0].nodeType).to.eql(index_1.NodeTypes.TEXT);
        chai_1.expect(div.children[1].nodeType).to.eql(index_1.NodeTypes.ELEMENT);
    });
    it("can create a virtual element with a text node binding", () => {
        const div = index_1.element("div", null, (value) => value);
        chai_1.expect(div.tagName).to.eql("div");
        chai_1.expect(div.children.length).to.eql(1);
        chai_1.expect(div.children[0].nodeType).to.eql(index_1.NodeTypes.TEXT);
        chai_1.expect(div.children[1].nodeType).to.eql(index_1.NodeTypes.ELEMENT);
    });
});
//# sourceMappingURL=basic-test.js.map