import { Hydrator, Binding, VirtualComponent, createTemplate } from './core';

class RepeatHydrator extends Hydrator {
  createBinding(root) {
    return new RepeatBinding(root, this);
  }
}

class RepeatBinding extends Binding {
  update(context) {
    const { childTemplate, attributes } = this.virtualNode;
    const { node } = this;
    const { each } = attributes;
    const newItems = each(context)      || [];
    const oldItems = this._currentItems || [];

    this._currentItems = newItems;

    const parentNode = node.parentNode;
    const startIndex = Array.prototype.indexOf.call(parentNode.childNodes, node);
    const oldChildren = this.children || [];
    const newChildren = this.children = new Array(newItems.length);

    for (let i = 0, n = newItems.length; i < n; i++) {
      const value = newItems[i];
      let child;

      if (i < oldChildren.length) {
        child = oldChildren[i];
      } else {
        const insertAfterChild = parentNode.childNodes[startIndex + i];
        const insertBeforeChild = insertAfterChild.nextSibling;
        child = childTemplate.createView(value);
        if (insertBeforeChild) {
          parentNode.insertBefore(child.node, insertBeforeChild);
        } else {
          parentNode.appendChild(child.node);
        }
      }
      

      child.update(value);
      newChildren[i] = child;
    }

    for (let i = newItems.length, n = oldChildren.length; i < n; i++) {
      oldChildren[i].detach().dispose();
    }
  }
}

export class RepeatComponent extends VirtualComponent {
  constructor(nodeName, attributes, children, options) {
    super(nodeName, attributes, []);
    this.childTemplate = createTemplate(children[0], options);
  }
  collectHydrators(hydrators) {
    super.collectHydrators(hydrators);
    hydrators.push(new RepeatHydrator(this));
  }
  toNativeNode(factory) {
    return factory.createTextNode('');
  }
}