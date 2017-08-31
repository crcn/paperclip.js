"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parser_1 = require("../parser");
const expressions_1 = require("../expressions");
describe(__filename + "#", () => {
    it("can parse a comment", () => {
        const node = parser_1.parse("<!--abc-->");
        chai_1.expect(node.type).to.eql(expressions_1.ExpressionType.COMMENT);
    });
    it("can parse a self closing element", () => {
        const element = parser_1.parse("<span />");
        chai_1.expect(element.type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.tagName).to.eql("span");
    });
    it("can parse a text node", () => {
        const textNode = parser_1.parse("abc");
        chai_1.expect(textNode.type).to.eql(expressions_1.ExpressionType.TEXT_NODE);
        chai_1.expect(textNode.value).to.eql("abc");
    });
    it("can parse a self closing element with attributes", () => {
        const element = parser_1.parse("<span a='b' c='d' />");
        chai_1.expect(element.type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.tagName).to.eql("span");
        chai_1.expect(element.attributes.length).to.eql(2);
        chai_1.expect(element.attributes[0]).to.eql({ type: expressions_1.ExpressionType.STRING_ATTRIBUTE, name: "a", value: "b" });
        chai_1.expect(element.attributes[1]).to.eql({ type: expressions_1.ExpressionType.STRING_ATTRIBUTE, name: "c", value: "d" });
    });
    it("can parse a self closing element with attributes that don't have a value", () => {
        const element = parser_1.parse("<span a />");
        chai_1.expect(element.type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.tagName).to.eql("span");
        chai_1.expect(element.attributes.length).to.eql(1);
        chai_1.expect(element.attributes[0]).to.eql({ name: "a", type: expressions_1.ExpressionType.STRING_ATTRIBUTE });
    });
    it("can parse an element with one child", () => {
        const element = parser_1.parse("<span>a</span>");
        chai_1.expect(element.type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.children.length).to.eql(1);
        chai_1.expect(element.children[0].type).to.eql(expressions_1.ExpressionType.TEXT_NODE);
    });
    it("can parse an element with multiple children", () => {
        const element = parser_1.parse("<span>a<h1> b </h1><h2>c</h2></span>");
        chai_1.expect(element.type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.children.length).to.eql(3);
        chai_1.expect(element.children[0].type).to.eql(expressions_1.ExpressionType.TEXT_NODE);
        chai_1.expect(element.children[1].type).to.eql(expressions_1.ExpressionType.ELEMENT);
        chai_1.expect(element.children[2].type).to.eql(expressions_1.ExpressionType.ELEMENT);
    });
    it("can parse a text block", () => {
        const block = parser_1.parse("{{name}}");
        chai_1.expect(block.type).to.eql(expressions_1.ExpressionType.TEXT_BLOCK);
    });
    it("can parse a text block with text nodes", () => {
        const fragment = parser_1.parse("{{a}} b {{c}}");
        chai_1.expect(fragment.type).to.eql(expressions_1.ExpressionType.FRAGMENT);
        chai_1.expect(fragment.children[0].type).to.eql(expressions_1.ExpressionType.TEXT_BLOCK);
        chai_1.expect(fragment.children[1].type).to.eql(expressions_1.ExpressionType.TEXT_NODE);
        chai_1.expect(fragment.children[1].value).to.eql(" b ");
        chai_1.expect(fragment.children[2].type).to.eql(expressions_1.ExpressionType.TEXT_BLOCK);
    });
    it("can parse an element with an attribute block", () => {
        const element = parser_1.parse("<span a={{b}} />");
        chai_1.expect(element.tagName).to.eql("span");
        chai_1.expect(element.attributes.length).to.eql(1);
        chai_1.expect(element.attributes[0].type).to.eql(expressions_1.ExpressionType.BLOCK_ATTRIBUTE);
    });
});
//# sourceMappingURL=parser-test.js.map