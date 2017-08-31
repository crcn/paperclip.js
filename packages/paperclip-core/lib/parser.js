"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./parser.peg");
exports.parse = (source) => {
    const ast = parser.parse(source);
    return ast;
};
//# sourceMappingURL=parser.js.map