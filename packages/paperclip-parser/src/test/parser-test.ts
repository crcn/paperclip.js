import { expect } from "chai";
import { parse } from "../parser";
import { ExpressionType, Element, ValueNode, Fragment } from "../expressions";

describe(__filename + "#", () => {
  it("can parse a comment", () => {
    const node = parse("<!--abc-->");
    expect(node.type).to.eql(ExpressionType.COMMENT);
  });

  it("can parse a self closing element", () => {
    const element = parse("<span />") as Element;
    expect(element.type).to.eql(ExpressionType.ELEMENT);
    expect(element.tagName).to.eql("span");
  });

  it("can parse a text node", () => {
    const textNode = parse("abc") as ValueNode;
    expect(textNode.type).to.eql(ExpressionType.TEXT_NODE);
    expect(textNode.value).to.eql("abc");
  });

  it("can parse a self closing element with attributes", () => {
    const element = parse("<span a='b' c='d' />") as Element;
    expect(element.type).to.eql(ExpressionType.ELEMENT);
    expect(element.tagName).to.eql("span");
    expect(element.attributes.length).to.eql(2);
    expect(element.attributes[0]).to.eql({ type: ExpressionType.STRING_ATTRIBUTE, name: "a" , value: "b" });
    expect(element.attributes[1]).to.eql({ type: ExpressionType.STRING_ATTRIBUTE, name: "c" , value: "d" });
  });

  it("can parse a self closing element with attributes that don't have a value", () => {
    const element = parse("<span a />") as Element;
    expect(element.type).to.eql(ExpressionType.ELEMENT);
    expect(element.tagName).to.eql("span");
    expect(element.attributes.length).to.eql(1);
    expect(element.attributes[0]).to.eql({ name: "a", type: ExpressionType.STRING_ATTRIBUTE });
  });

  it("can parse an element with one child", () => {
    const element = parse("<span>a</span>") as Element;
    expect(element.type).to.eql(ExpressionType.ELEMENT);
    expect(element.children.length).to.eql(1);
    expect(element.children[0].type).to.eql(ExpressionType.TEXT_NODE);
  });

  it("can parse an element with multiple children", () => {
    const element = parse("<span>a<h1> b </h1><h2>c</h2></span>") as Element;
    expect(element.type).to.eql(ExpressionType.ELEMENT);
    expect(element.children.length).to.eql(3);
    expect(element.children[0].type).to.eql(ExpressionType.TEXT_NODE);
    expect(element.children[1].type).to.eql(ExpressionType.ELEMENT);
    expect(element.children[2].type).to.eql(ExpressionType.ELEMENT);
  });

  it("can parse a text block", () => {
    const block = parse("{{name}}") as ValueNode;
    expect(block.type).to.eql(ExpressionType.TEXT_BLOCK);
  });

  it("can parse a text block with text nodes", () => {
    const fragment = parse("{{a}} b {{c}}") as Fragment;
    expect(fragment.type).to.eql(ExpressionType.FRAGMENT);
    expect(fragment.children[0].type).to.eql(ExpressionType.TEXT_BLOCK);
    expect(fragment.children[1].type).to.eql(ExpressionType.TEXT_NODE);
    expect((fragment.children[1] as ValueNode).value).to.eql(" b ");
    expect(fragment.children[2].type).to.eql(ExpressionType.TEXT_BLOCK);
  });

  it("can parse an element with an attribute block", () => {
    const element = parse("<span a={{b}} />") as Element;
    expect(element.tagName).to.eql("span");
    expect(element.attributes.length).to.eql(1);
    expect(element.attributes[0].type).to.eql(ExpressionType.BLOCK_ATTRIBUTE);
  });
});