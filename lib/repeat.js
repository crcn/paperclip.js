import { Hydrator, Binding, VirtualComponent, createTemplate } from './core';
import { diffArray } from './utils';

class RepeatHydrator extends Hydrator {
  createBinding(root) {
    return new RepeatBinding(root, this);
  }
}

class RepeatBinding extends Binding {
  constructor(root, hydrator) {
    super(root, hydrator);
    this.children = [];
  }
  
  update(context) {
    const { childTemplate, attributes } = this.virtualNode;
    const { node } = this;
    const { each } = attributes;
    const newItems = each(context)      || [];
    const oldItems = this._currentItems || [];

    this._currentItems = newItems;

    const parentNode = node.parentNode;
    const startIndex = parentNode.childNodes.indexOf(node);
    let i = 0;

    diffArray(oldItems, newItems, () => 0).accept({
      visitUpdate: ({ originalOldIndex, patchedOldIndex, newValue, index }) => {
        this.children[index].update(newValue);
      },
      visitInsert: ({ value, index }) => {
        const insertAfterChild = parentNode.childNodes[startIndex + index];
        const insertBeforeChild = insertAfterChild.nextSibling;
        const child = childTemplate.createView(value);
        this.children.splice(index, 0, child);
        if (insertBeforeChild) {
          parentNode.insertBefore(child.node, insertBeforeChild);
        } else {
          parentNode.appendChild(child.node);
        }
      },
      visitRemove: ({ value, index }) => {
        const [child] = this.children.splice(index, 1);
        child.detach().dispose();
      }
    });
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