(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  Repeat: require('./repeat')
}
},{"./repeat":4}],2:[function(require,module,exports){
(function (global){
class View {
  constructor(template, node, bindings) {
    this.template = template;
    this.node = node;
    this.bindings = bindings;
  }
  dispose() {
    this.template.$viewPool.push(this);
    return this;
  }
  update(context) {
    for (const binding of this.bindings) {
      binding.update(context);
    }
    return this;
  }
  detach() {
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
    return this;
  }
}

class Template {
  constructor(virtualNode, options) {
    this.virtualNode = virtualNode;
    virtualNode.collectHydrators(this.hydrators = []);
    this.nativeNode = virtualNode.toNativeNode(options.document);
    this.$viewPool = [];
  }
  createView(context) {
    const eview = this.$viewPool.shift()
    if (eview) return eview;
    
    const node = this.nativeNode.cloneNode(true);
    const bindings = [];
    for (const hydrator of this.hydrators) {
      bindings.push(hydrator.createBinding(node));
    }
    const view = new View(this, node, bindings);
    if (arguments.length !== 0) {
      view.update(context);
    }
    return view;
  }
}

class VirtualComponent {
  constructor(name, attributes, children, options) {
    this.name       = name;
    this.attributes = attributes;
    this.options    = options;
    this.childNodes = children;
  }
  collectHydrators(hydrators) {

  }
  toNativeNode(document) {
    return document.createTextNode('');
  }
}

class VirtualElement {
  constructor(name, attributes, children, options) {
    this.name       = name;
    this.attributes = attributes;
    this.options    = options;
    this.childNodes = children;
    for (const child of children) {
      child.parentNode = this;
    }
  }
  collectHydrators(hydrators) {
    for (const key in this.attributes) {
      const value = this.attributes[key];
      if (typeof value === 'function') {
        hydrators.push(this.createAttributeHydrator(key, value));
      }
    }
    for (const child of this.childNodes) {
      child.collectHydrators(hydrators);
    }
  }
  createAttributeHydrator(key, value) {
    return new ElementAttributeHydrator(this, key, value);
  }
  toNativeNode(document) {
    const element = document.createElement(this.name);
    for (const key in this.attributes) {
      const value = this.attributes[key];
      if (/number|string/.test(typeof value)) {
        element.setAttribute(key, value);
      }
    }
    for (const child of this.childNodes) {
      element.appendChild(child.toNativeNode(document));
    }
    return element;
  }
}

function getNodePath(node) {
  const path = [];
  let currentNode = node;
  while(currentNode.parentNode) {
    path.unshift(currentNode.parentNode.childNodes.indexOf(currentNode));
    currentNode = currentNode.parentNode;
  }
  return path;
}

function findNode(root, path) {
  let currentNode = root;
  for (let i = 0, n = path.length; i < n; i++) {
    currentNode = currentNode.childNodes[path[i]];
  }
  return currentNode;
}

class VirtualTextNode {
  constructor(nodeValue) {
    this.nodeValue = nodeValue;
  }
  collectHydrators(hydrators) {
    if (typeof this.nodeValue === 'function') {
      hydrators.push(new TextNodeHydrator(this, this.nodeValue));
    }
  }
  toNativeNode(document) {
    return document.createTextNode(this.nodeValue);
  }
}
class Hydrator {
  constructor(virtualNode) {
    this.virtualNode = virtualNode;
    this.path        = getNodePath(virtualNode);
  }
}

class ComputeHydrator extends Hydrator {
  constructor(virtualNode, compute) {
    super(virtualNode);
    this.compute = compute;
  }
}

class ElementAttributeHydrator extends ComputeHydrator {
  constructor(virtualNode, attributeName, compute) {
    super(virtualNode, compute);
    this.attributeName = attributeName;
  }
  createBinding(root) {
    return new AttributeBinding(root, this);
  }
}

class TextNodeHydrator extends ComputeHydrator {
  createBinding(root) {
    return new TextNodeBinding(root, this);
  }
}

class Binding {
  constructor(root, hydrator) {
    this.hydrator = hydrator;
    this.node        = findNode(root, hydrator.path);
    this.virtualNode = hydrator.virtualNode;
  }
}

class ComputeBinding extends Binding {
  constructor(root, hydrator) {
    super(root, hydrator);
    this._compute = hydrator.compute;
  }
  update(context) {
    const newValue = this._compute(context);
    if (this.currentValue !== newValue || !this._hasSetValue) {
      this._hasSetValue   = true;
      this._updateNode(this.currentValue = newValue);
    }
  }
}

class AttributeBinding extends ComputeBinding {
  _updateNode(newValue) {
    this.node.setAttribute(this.hydrator.attributeName, newValue);
  }
}

class TextNodeBinding extends ComputeBinding {
  _updateNode(newValue) {
    this.node.nodeValue = newValue;
  }
}

function createNativeElement(nodeName, attributes, children) {
  return new VirtualElement(nodeName, attributes, children);
}

function createTemplate(vdomOrFactory, options = {}) {

  function createTextNode(nodeValue) {
    return new VirtualTextNode(nodeValue);
  }
  
  function createElement(nodeName, attributes = {}, children = []) {
    const clazz = options.components && options.components[nodeName] || VirtualElement;
    return new clazz(nodeName, attributes, children, options);
  }

  const vdom = typeof vdomOrFactory === 'function' ? vdomOrFactory(
    createElement,
    createTextNode
  ) : vdomOrFactory;

  return new Template(vdom, {
    document: options.document || global.document
  });
}

module.exports = {
  createTemplate: createTemplate,
  VirtualElement: VirtualElement,
  VirtualComponent: VirtualComponent,
  Hydrator: Hydrator,
  Binding: Binding,
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){

module.exports = window.paperclip = Object.assign({}, require('./core'), require('./components'));
},{"./components":1,"./core":2}],4:[function(require,module,exports){
const { Hydrator, Binding, VirtualComponent, createTemplate } = require('./core');
const { diffArray } = require('./utils');

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

class VirtualRepeat extends VirtualComponent {
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

module.exports = VirtualRepeat;
},{"./core":2,"./utils":5}],5:[function(require,module,exports){
// taken from tandem

const createInsertMutation = (index, value) => {
  return {
    value, 
    index,
    accept(visitor) {
      visitor.visitInsert(this);
    }
  }
};

const createRemoveMutation = (value, index) => {
  return {
    value,
    index,
    accept(visitor) {
      visitor.visitRemove(this);
    }
  };
};

const createUpdateMutation = (originalOldIndex, patchedOldIndex, newValue, index) => {
  return {
    originalOldIndex,
    patchedOldIndex,
    newValue,
    index,
    accept(visitor) {
      visitor.visitUpdate(this);
    }
  };
};

const createArrayMutations = (mutations) => {
  return {
    accept(visitor) {
      for (const mutation of mutations) {
        mutation.accept(visitor);
      }
    }
  }
}

 exports.diffArray = (oldArray, newArray, countDiffs) => {

  // model used to figure out the proper mutation indices
  const model    = [].concat(oldArray);

  // remaining old values to be matched with new values. Remainders get deleted.
  const oldPool  = [].concat(oldArray);

  // remaining new values. Remainders get inserted.
  const newPool  = [].concat(newArray);

  const mutations = [];
  let   matches   = [];

  for (let i = 0, n = oldPool.length; i < n; i++) {

    const oldValue = oldPool[i];
    let bestNewValue;

    let fewestDiffCount = Infinity;

    // there may be multiple matches, so look for the best one
    for (let j = 0, n2 = newPool.length; j < n2; j++) {

      const newValue   = newPool[j];

      // -1 = no match, 0 = no change, > 0 = num diffs
      let diffCount = countDiffs(oldValue, newValue);

      if (~diffCount && diffCount < fewestDiffCount) {
        bestNewValue    = newValue;
        fewestDiffCount = diffCount;
      }

      // 0 = exact match, so break here.
      if (fewestDiffCount === 0) break;
    }

    // subtract matches from both old & new pools and store
    // them for later use
    if (bestNewValue != null) {
      oldPool.splice(i--, 1);
      n--;
      newPool.splice(newPool.indexOf(bestNewValue), 1);

      // need to manually set array indice here to ensure that the order
      // of operations is correct when mutating the target array.
      matches[newArray.indexOf(bestNewValue)] = [oldValue, bestNewValue];
    }
  }

  for (let i = oldPool.length; i--;) {
    const oldValue  = oldPool[i];
    const index     = oldArray.indexOf(oldValue);
    mutations.push(createRemoveMutation(oldValue, index));
    model.splice(index, 1);
  }

  // sneak the inserts into the matches so that they're
  // ordered propertly along with the updates - particularly moves.
  for (let i = 0, n = newPool.length; i < n; i++) {
    const newValue = newPool[i];
    const index    = newArray.indexOf(newValue);
    matches[index] = [undefined, newValue];
  }

  // apply updates last using indicies from the old array model. This ensures
  // that mutations are properly applied to whatever target array.
  for (let i = 0, n = matches.length; i < n; i++) {
    const match = matches[i];

    // there will be empty values since we're manually setting indices on the array above
    if (match == null) continue;

    const [oldValue, newValue] = matches[i];
    const newIndex = i;

    // insert
    if (oldValue == null) {
      mutations.push(createInsertMutation(newIndex, newValue));
      model.splice(newIndex, 0, newValue);
    // updated
    } else {
      const oldIndex = model.indexOf(oldValue);
      mutations.push(createUpdateMutation(oldArray.indexOf(oldValue), oldIndex, newValue, newIndex));
      if (oldIndex !== newIndex) {
        model.splice(oldIndex, 1);
        model.splice(newIndex, 0, oldValue);
      }
    }
  }

  return createArrayMutations(mutations);
}
},{}]},{},[3]);
