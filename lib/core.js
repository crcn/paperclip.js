"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flattenArray = (value) => Array.isArray(value) ? value.reduce((a, b) => [].concat(a, flattenArray(b)), []) : [value];
/**
 * Creates new elements or components
 */
var NodeTypes;
(function (NodeTypes) {
    // W3C standard
    NodeTypes[NodeTypes["ELEMENT"] = 1] = "ELEMENT";
    NodeTypes[NodeTypes["TEXT"] = 3] = "TEXT";
    NodeTypes[NodeTypes["COMMENT"] = 8] = "COMMENT";
    NodeTypes[NodeTypes["FRAGMENT"] = 11] = "FRAGMENT";
    // CUSTOM
    NodeTypes[NodeTypes["COMPONENT"] = 21] = "COMPONENT";
    NodeTypes[NodeTypes["TEXT_BINDING"] = 0] = "TEXT_BINDING";
})(NodeTypes = exports.NodeTypes || (exports.NodeTypes = {}));
;
exports.textNode = (nodeValue) => ({
    nodeType: NodeTypes.TEXT,
    nodeValue
});
function element(tagNameOrComponent, attributes, ...children) {
    if (typeof tagNameOrComponent === "string") {
        return {
            nodeType: NodeTypes.ELEMENT,
            tagName: tagNameOrComponent,
            attributes: attributes,
            children: flattenArray(children).map((child) => typeof child === "string" ? exports.textNode(child) : child)
        };
    }
}
exports.element = element;
//# sourceMappingURL=core.js.map