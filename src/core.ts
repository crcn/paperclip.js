const flattenArray = (value) => Array.isArray(value) ? value.reduce((a, b) => [].concat(a, flattenArray(b)), []) : [value];

/**
 * Creates new elements or components
 */

 export enum NodeTypes {

  // W3C standard
  ELEMENT   = 1,
  TEXT      = 3,
  COMMENT   = 8,
  FRAGMENT  = 11,

  // CUSTOM
  COMPONENT = 21,
  TEXT_BINDING = 22
};

export type VirtualNode = {
  nodeType: NodeTypes
};

export type VirtualBindingFn = (value: any) => any;

export type VirtualTextBinding = {
  nodeType: NodeTypes.TEXT_BINDING,
  run: VirtualBindingFn
};

export type VirtualContainer =  {

}


export type VirtualChildNode = VirtualNode|string|VirtualBindingFn;

export type VirtualElement = {
  tagName: string,
  children: VirtualNode[]
} & VirtualNode;

export type VirtualComponent = {

} & VirtualNode;

export type VirtualTextNode = {
  nodeValue: string
} & VirtualNode;

export const textNode = (nodeValue: string): VirtualTextNode => ({
  nodeType: NodeTypes.TEXT,
  nodeValue
});

export const textBinding = (run: VirtualBindingFn): VirtualTextBinding => ({
  nodeType: NodeTypes.TEXT_BINDING,
  run,
});

export function element(component: VirtualComponent, attributes: any, ...children: Array<string|VirtualNode>);
export function element(tagName: string, attributes: any, ...children: Array<string|VirtualNode>);
export function element(tagNameOrComponent: any, attributes: any, ...children: Array<string|VirtualNode>) {
  if (typeof tagNameOrComponent === "string") {
    return {
      nodeType: NodeTypes.ELEMENT,
      tagName: tagNameOrComponent,
      attributes: attributes,
      children: flattenArray(children).map(mapChildNode)
    } as VirtualElement
  }
};

const mapChildNode = (child: VirtualChildNode) => {
  const toc = typeof child;
  switch(toc) {
    case "string": return textNode(child as string);
    case "function": return textBinding(child as VirtualBindingFn);
    default: return child;
  }
}