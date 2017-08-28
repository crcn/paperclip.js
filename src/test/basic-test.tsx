import { element, NodeTypes } from "../index";
import { expect } from "chai";

describe(__filename + "#", () => {
  it("can create a virtual element", () => {
    const div = <div />;
    expect(div.tagName).to.eql("div");
  });

  it("can create a virtual element with children", () => {
    const div = <div>a<span>b</span></div>;
    expect(div.tagName).to.eql("div");
    expect(div.children.length).to.eql(2);
    expect(div.children[0].nodeType).to.eql(NodeTypes.TEXT);
    expect(div.children[1].nodeType).to.eql(NodeTypes.ELEMENT);
  });

  it("can create a virtual element with children as an array", () => {
    const div = <div>{ ['a', <span>b</span>] }</div>;
    expect(div.tagName).to.eql("div");
    expect(div.children.length).to.eql(2);
    expect(div.children[0].nodeType).to.eql(NodeTypes.TEXT);
    expect(div.children[1].nodeType).to.eql(NodeTypes.ELEMENT);
  });

  it("can create a virtual element with a text node binding", () => {
    const div = <div>{ (value) => value }</div>;
    expect(div.tagName).to.eql("div");
    expect(div.children.length).to.eql(1);
    expect(div.children[0].nodeType).to.eql(NodeTypes.TEXT_BINDING);
  });
});