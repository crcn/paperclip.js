import * as parser from "./parser.peg";
import { Expression } from "./expressions";

export const parse = (source: string): Expression => {
  const ast = parser.parse(source);
  return ast;
}