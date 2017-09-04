import { 
  parse as parsePC, 
  Expression, 
  ExpressionType,
  Fragment,
  Element,
  ParentExpression,
  ValueNode,
} from "paperclip-parser";

export type Scope = {
  origin?: string;
  context: any;
  imports: {

    // namespace
    [identifier: string]: Scope
  };
  components: {
    [identifier: string]: Component
  }
};

export type Component = (props: any) => Promise<Node>;

const setupScope = (scope: Scope): Scope => ({
  components: {},
  ...scope
})

export const load = (urlOrContent, scope: Scope = {}) => {
  scope = setupScope(scope);
  if (/^https?\:\/\//.test(urlOrContent)) {
    return loadURL(urlOrContent, scope);
  } else {
    return loadContent(urlOrContent, scope);
  }
}

const loadURL = async (url: string, scope: Scope) => loadContent(await (await fetch(url)).text(), scope);

const loadContent = async (content: string, scope: Scope) => {
  const ast = parsePC(content);
  await loadASTNode(ast, scope);
  return scope;
};

const loadASTNode = async (ast: Expression, scope: Scope): Promise<Node> => {
  if (ast.type === ExpressionType.FRAGMENT) {
    return loadFragment(ast as Fragment, scope);
  } else if (ast.type === ExpressionType.ELEMENT) {
    return loadElement(ast as Element, scope);
  } else if (ast.type === ExpressionType.TEXT_NODE) {
    return loadTextNode(ast as ValueNode, scope);
  }
  return null;
};

const loadFragment = async (ast: Fragment, scope: Scope) => {
  const fragment = document.createDocumentFragment();
  await loadChildren(fragment, ast, scope);
  return fragment;
};

const loadChildren = async (parent: Node, ast: ParentExpression, scope: Scope) => {
  for (const child of ast.children) {
    const childNode = await loadASTNode(child, scope);
    if (!childNode) {
      continue;
    }
    parent.appendChild(childNode);
  }
};

const loadElement = async (ast: Element, scope: Scope) => {
  switch(ast.tagName) {
    case "link": return loadLinkElement(ast, scope);
    case "repeat": return loadRepeatElement(ast, scope);
    case "component": return loadComponent(ast, scope);
    default: {

      // TODO - check imports 
      return loadBasicElement(ast, scope);
    }
  }
};

const loadLinkElement = async (ast: Element, scope: Scope) => {
  const href = getAttributeValue(ast, "href");
  const rel  = getAttributeValue(ast, "rel");
  const id  = getAttributeValue(ast, "id");

  if (rel === "import") {
    scope.imports[id] = await loadComponentFile(href, scope);
  } else if (rel === "stylesheet") {

    // TODO
    await loadStylesheet(href, scope);
  }

  return null;
};

const loadStylesheet = async (href: string, scope: Scope) => {

};

const loadComponentFile = async (href: string, scope: Scope) => {
  return await load(href);
};

const loadRepeatElement = async (ast: Element, scope: Scope) => {
  return loadBasicElement(ast, scope);
};

const loadComponent = async (ast: Element, scope: Scope) => {
  scope.components[ast.tagName] = async (props) => {
    return await loadFragment(ast as Fragment, {
      ...scope,
      context: props
    });
  };
  return null;
};

const loadBasicElement = async (ast: Element, scope: Scope) => {
  const element = document.createElement(ast.tagName);
  // TODO - set source
  for (const {name, value} of ast.attributes) {
    element.setAttribute(name, value);
  }
  await loadChildren(element, ast, scope);
  return element;
};

const loadTextNode = (ast: ValueNode, scope: Scope) => {
  const text = document.createTextNode(ast.value);
  return text;
};

const loadTextBlockNode = (ast: ValueNode, scope: Scope) => {
  const text = document.createTextNode(ast.value);
  return text;
};

const getAttributeValue = (ast: Element, name: string) => {
  const found = ast.attributes.find((attr) => attr.name === name);
  return found && found.value;
};