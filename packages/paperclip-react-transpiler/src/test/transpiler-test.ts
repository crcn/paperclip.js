import { stripWS } from "./utils";
import { expect } from "chai";
import { transpile } from "../index";

describe(__filename + "#", () => {
  it("can transpile a simple self closing element", () => {
    const jsSource = transpile(`<component name="default"><a /></component>`);
    expect(stripWS(jsSource)).to.eql(stripWS(`
      var React = require("react");
      exports.default = function Component_default(props) {
        with (props) {
          return React.createElement("a", null);
        }
      };`));
  });

  it("can transpile a text block", () => {
    const jsSource = transpile(`<component name="default">{{message}}</component>`);
    expect(stripWS(jsSource)).to.eql(stripWS(`
      var React = require("react");
      exports.default = function Component_default(props) {
        with (props) {
          return React.createElement("span", null, String(message));
        }
      };`));
  });

  it("ignores comments", () => {
    const jsSource = transpile(`<component name="default"><!--a-->{{message}}</component>`);
    expect(stripWS(jsSource)).to.eql(stripWS(`
      var React = require("react");
      exports.default = function Component_default(props) {
        with (props) {
          return React.createElement("span", null, String(message));
        }
      };`));
  });


  it("can transpile an element with a dynamic attribute", () => {
    const jsSource = transpile(`
      <component>
        <div class={{className}}>
        </div>
      </component>
    `);
    expect(stripWS(jsSource)).to.eql(stripWS(`
      var React = require("react");
      exports.default = function Component_default(props) {
        with (props) {
          return React.createElement("div", {
            className: className
          });
        }
      };`));
  });

  it("can register multiple components", () => {
    const jsSource = transpile(`
      <component>
        a
      </component>
      <component id="test">
        b
      </component>
    `);
    expect(stripWS(jsSource)).to.eql(stripWS(`
      var React = require("react");
      exports.default = function Component_default(props) {
        with (props) {
          return React.createElement("span", null, "a");
        }
      };
      exports.test = function Component_test(props) {
        with (props) {
          return React.createElement("span", null, "b");
        }
      };
    `));
  });

  xit("parses transpiles style attributes as objects", () => {

  });
  
});