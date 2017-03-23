const { VirtualElement, Hydrator, Binding, createTemplate } = require('./lib/paperclip');

class Element {
  constructor(nodeName) {
    this.nodeName   = nodeName;
    this.childNodes = [];
    this.attributes = {};
  }

  appendChild(child) {
    this.childNodes.push(child);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  cloneNode(deep) {
    const element = new Element(this.nodeName);
    for (const key in this.attributes) {
      element.setAttribute(key, this.attributes[key]);
    }
    for (const child of this.childNodes) {
      element.appendChild(child.cloneNode(true));
    }
    return element;
  }

  toString() {
    let buffer = `<${this.nodeName}`;

    for (const name in this.attributes) {
      buffer += ` ${name}="${this.attributes[name]}"`;
    }

    buffer += `>`;

    for (const child of this.childNodes) {
      buffer += child.toString();
    }

    buffer += `</${this.nodeName}>`;

    return buffer;
  }
}

class TextNode {
  constructor(nodeValue) {
    this.nodeValue = nodeValue;
  }
  cloneNode(deep) {
    return new TextNode(this.nodeValuee);
  }
  toString() {
    return this.nodeValue;
  }
}

const document = {
  createElement(nodeName) {
    return new Element(nodeName);
  },
  createTextNode(nodeValue) {
    return new TextNode(nodeValue);
  }
};

// class VirtualRepeatHydrator {
//   createBinding()
// }

class RepeatHydrator extends Hydrator {
  createBinding(root) {
    return new RepeatBinding(root, this);
  }
}

class RepeatBinding extends Binding {
  update(context) {

  }
}

class VirtualRepeat extends VirtualElement {
  constructor(nodeName, attributes, children, options) {
    super(nodeName, attributes, []);
    this.childTemplate = createTemplate(children[0], options);
  }
  collectHydrators(hydrators) {
    super.collectHydrators(hydrators);
    hydrators.push(new RepeatHydrator(this));
  }
  toNativeNode(factory) {
    return factory.createElement('div');
  }
}

const template = createTemplate(function(element, textNode) {
  return element('div', {
    class: function(context) {
      return context.name;
    }
  }, [element('repeat', { each: (({ items }) => items || []), }, [textNode(function(context) {
    return context.text;
  })])]);
}, {
  document,
  components: {
    repeat: VirtualRepeat
  }
});

const view = template.createView();
view.update({ text: 'blarg' });
console.log(view.node.toString());
view.update({ text: 'blarg', name: 'test' });
console.log(view.node.toString());