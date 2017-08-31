import { LocationRange } from "pegjs";

export enum ExpressionType {
  TEXT_NODE,
  TEXT_BLOCK,
  ELEMENT,
  COMMENT,
  BLOCK_ATTRIBUTE,
  STRING_ATTRIBUTE,
  FRAGMENT,
};

export type Expression = {
  type: ExpressionType;
  locationRange: LocationRange;
};

export type ValueNode = {
  value: Expression;
} & Expression;

export type Attribute = {
  name: string;
  value: string;
} & Expression;

export type Element = {
  tagName: string;
  attributes: Attribute[];
  children: Expression[];
} & Expression;

export type Fragment = {
  children: Expression[];
} & Expression;