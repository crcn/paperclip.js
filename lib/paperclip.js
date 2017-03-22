(function() {

  class View {
    constructor(template, node, bindings) {
      this.template = template;
      this.node = node;
      this.bindings = bindings;
    }
    dispose() {
      this.template.$viewPool.push(this);
    }
    update(context) {
      for (const binding of this.bindings) {
        binding.update(context);
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
    createView() {
      const eview = this.$viewPool.shift()
      if (eview) return eview;
      
      const node = this.nativeNode.cloneNode(true);
      const bindings = [];
      for (const hydrator of this.hydrators) {
        bindings.push(hydrator.createBinding(node));
      }
      return new View(this, node, bindings);
    }
  }

  class VirtualElement {
    constructor(name, attributes, children) {
      this.name       = name;
      this.attributes = attributes;
      this.childNodes = children;
      for (const child of children) {
        child.parentNode = this;
      }
    }
    collectHydrators(hydrators) {
      for (const key in this.attributes) {
        const value = this.attributes[key];
        if (typeof value === 'function') {
          hydrators.push(new ElementAttributeHydrator(this, key, value));
        }
      }
      for (const child of this.childNodes) {
        child.collectHydrators(hydrators);
      }
    }
    toNativeNode(document) {
      const element = document.createElement(this.name);
      for (const key in this.attributes) {
        const value = this.attributes[key];
        if (typeof value !== 'function') {
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
    constructor(virtualNode, compute) {
      this.virtualNode = virtualNode;
      this.path = getNodePath(virtualNode);
      this.compute = compute;
    }
  }

  class ElementAttributeHydrator extends Hydrator {
    constructor(virtualNode, attributeName, compute) {
      super(virtualNode, compute);
      this.attributeName = attributeName;
    }
    createBinding(root) {
      return new ElementBinding(root, this);
    }
  }

  class TextNodeHydrator extends Hydrator {
    createBinding(root) {
      return new TextNodeBinding(root, this);
    }
  }

  class Binding {
    constructor(root, hydrator) {
      this.hydrator = hydrator;
      this.node     = findNode(root, hydrator.path);
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

  class ElementBinding extends Binding {
    _updateNode(newValue) {
      this.node.setAttribute(this.hydrator.attributeName, newValue);
    }
  }

  class TextNodeBinding extends Binding {
    _updateNode(newValue) {
      this.node.nodeValue = newValue;
    }
  }

  function createElement(nodeName, attributes, children) {
    return new VirtualElement(nodeName, attributes, children);
  }

  function createTextNode(nodeValue) {
    return new VirtualTextNode(nodeValue);
  }

  function createTemplate(vdomFactory, options = {}) {
    return new Template(vdomFactory(
      createElement,
      createTextNode
    ), {
      document: options.document || global.document
    });
  }

  class Component {
    
  }

  const exports = {
    createTemplate: createTemplate,
    Component: Component
  };
  
  if (typeof module !== 'undefined') {
    module.exports = exports;
  } else if (typeof window !== 'undefined') {
    window.paperclip = exports;
  }
})();