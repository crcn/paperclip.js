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

export type ParentExpression = {
  children: Expression[];
} & Expression;

export type ValueNode = {
  value: string;
} & Expression;

export type Attribute = {
  name: string;
  value: string;
} & Expression;

export type Element = {
  tagName: string;
  attributes: Attribute[];
} & ParentExpression;

export type Fragment = ParentExpression;