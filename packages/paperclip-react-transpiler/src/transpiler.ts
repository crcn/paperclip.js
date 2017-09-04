import { 
  parse, 
  Expression, 
  Fragment, 
  Element,
  ValueNode,
  ParentExpression,
  ExpressionType
} from "paperclip-parser";

import * as uglify from "uglify-js";

export type TranspileOptions = {
  embedSourceLocation?: boolean;
};

export const transpile = (content: string, options?: TranspileOptions) => {
  const ast = parse(content);

  let buffer = stringifyImports(ast as ParentExpression, options);

  buffer += `var React = require("react");\n\n`;

  buffer += stringifyComponents(ast);

  buffer = uglify.parse(buffer).print_to_string({
    beautify: true
  });

  return buffer;
};

const stringifyImports = (ast: ParentExpression, options?: TranspileOptions) => {
  const links = filterLinkElements(ast);

  if (links.length === 0) {
    return "";
  }

  let buffer = `var imports = {};\n`;

  for (const link of links) {
    buffer += `Object.assign(imports, require("${getAttribute(link, "href")}"));\n`;
  }

  return buffer;
};

const stringifyComponents = (ast: Expression) => {
  return filterComponents(ast).map((component, index) => stringifyComponent(component, index + 1, ast)).join("\n");
};

const stringifyComponent = (component: Element, index: number, root: Expression) => {

  const name = getAttribute(component, "id") || "default";
  
  const componentName = `Component_${name}`;

  // TODO - do not use with props -- transform block attributes instead
  let buffer = `exports.${name} = function ${componentName}(props) {
    with(props) {
      return ${stringifySingleChild(component)}
    }
  }\n`;

  return buffer;
}

const stringifyJSX = (node: Expression) => {
  switch(node.type) {
    case ExpressionType.ELEMENT: return stringifyElement(node as Element);
    case ExpressionType.TEXT_BLOCK: return stringifyTextBlock(node as ValueNode);
    case ExpressionType.TEXT_NODE: return stringifyTextNode(node as ValueNode);
    case ExpressionType.COMMENT: return stringifyTextNode(node as ValueNode);
    default: {
      throw new Error(`Cannot stringify expression ${node.type} as JSX`);
    }
  }
};


const stringifySingleChild = (node: ParentExpression) => {
  const stringifiableChildren = getStringifiableChildren(node);
  let child: string = stringifiableChildren.map(stringifyJSX).join(", ");
  

  if (stringifiableChildren.length > 1 || stringifiableChildren[0].type !== ExpressionType.ELEMENT) {

    // wrap in span
    child = `React.createElement("span", null, ${child})`;
  }
  
  return child;
};

const getStringifiableChildren = (node: ParentExpression) => omitWhitespaceChildren(node.children.filter(child => child.type !== ExpressionType.COMMENT && node));

const omitWhitespaceChildren = (children: Expression[]) => children.filter(child => child.type !== ExpressionType.TEXT_NODE || String((child as ValueNode).value || "").trim() !== "") as Expression[];

const getJSXAttributeName = (name: string) => {
  switch(name) {
    case "class": return "className";
  }
  return name;
};

const stringifyElement = (node: Element) => {
  let buffer = `React.createElement("${node.tagName}"`;

  if (node.attributes.length === 0) {
    buffer += ", null";
  } else {

    buffer += ", {";


    for (const {type, name, value} of node.attributes) {
      let tValue: string = ExpressionType.BLOCK_ATTRIBUTE ? String(value) : `"${value}"`;
      let tName: string = getJSXAttributeName(name);

      buffer += `"${tName}": ${tValue},`;
    }

    buffer += "}";
  }

  const stringifiableChildren = getStringifiableChildren(node);

  if (stringifiableChildren.length) {

    let children: string = stringifiableChildren.map(stringifyJSX).join(", ");

    buffer += `, ${children})`;
  } else {
    buffer += `)`;
  }
  
  return buffer;
};

const stringifyComment = (node: ValueNode) => {

};

const stringifyTextBlock = (node: ValueNode) => {
  return `String(${node.value})`;
};

const stringifyTextNode = (node: ValueNode) => {
  return `"${String(node.value).trim()}"`
};

const getAttribute = (element: Element, name: string) => {
  const found = element.attributes.find((attr) => attr.name === name);
  return found && found.value;
}


const filterComponents = (ast: Expression) => filterElements(ast).filter(element => element.tagName.toLowerCase() === "component");

const filterLinkElements = (ast: Expression) => filterElements(ast).filter(element => element.tagName.toLowerCase() === "link");

const filterElements = (ast: Expression) => filterExpressions(ast, (expression) => expression.type === ExpressionType.ELEMENT) as Element[];

const filterExpressions = (ast: Expression, filter: (expression: Expression) => boolean) => {
  if (filter(ast)) {
    return [ast];
  }
  return ((ast as ParentExpression).children || []).reduce((a, b) => {
    return [...a, ...filterExpressions(b, filter)];
  }, []);
}

