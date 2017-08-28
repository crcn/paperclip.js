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
  TEXT_BINDING = 
};

export type VirtualNode = {
  nodeType: NodeTypes
};

export type VirtualContainer =  {

}

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

export function element(component: VirtualComponent, attributes: any, ...children: Array<string|VirtualNode>);
export function element(tagName: string, attributes: any, ...children: Array<string|VirtualNode>);
export function element(tagNameOrComponent: any, attributes: any, ...children: Array<string|VirtualNode>) {
  if (typeof tagNameOrComponent === "string") {
    return {
      nodeType: NodeTypes.ELEMENT,
      tagName: tagNameOrComponent,
      attributes: attributes,
      children: flattenArray(children).map((child) => typeof child === "string" ? textNode(child) : child)
    } as VirtualElement
  }
}
