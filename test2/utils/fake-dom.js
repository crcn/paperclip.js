
const Element = class {
  constructor(nodeName) {
    this.nodeName   = nodeName;
    this.childNodes = [];
    this.attributes = {};
    this.nodeType = 1;
  }

  appendChild(child) {
    child.parentNode = this;
    const previousChild = this.childNodes[this.childNodes.length - 1];
    this.childNodes.push(child);
    if (previousChild) {
      previousChild.nextSibling = child;
      child.previousSibling = previousChild;
    }
  }

  get outerHTML() {
    let attributesString = '';
    
    for (let name in this.attributes) {
      attributesString += ` ${name}="${this.attributes[name]}"`;
    }

    return `<${this.nodeName}${attributesString}>${this.innerHTML}</${this.nodeName}>`;
  }

  get innerHTML() {
    return this.childNodes.map(child => child.outerHTML || child.nodeValue).join('')
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index === -1) return;
    child.parentNode = undefined;
    this.childNodes.splice(index, 1);

    const nextSibling = child.nextSibling;
    if (child.previousSibling) {
      child.previousSibling = nextSibling;
    }

    child.nextSibling = child.previousSibling = undefined;
  }

  insertBefore(newNode, referenceNode) {
    const index = this.childNodes.indexOf(referenceNode);
    if (index === -1) throw new Error(`Reference child node does not exist`);
    this.childNodes.splice(index, 0, newNode);
    newNode.parentNode = this;
    const previousSibling = referenceNode.previousSibling;
    newNode.nextSibling = referenceNode;
    referenceNode.previousSibling = newNode;
    previousSibling.nextSibling = newNode;
    newNode.previousSibling = previousSibling;
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

const TextNode = class {
  constructor(nodeValue) {
    this.nodeValue = nodeValue;
    this.nodeType = 3;
  }
  cloneNode(deep) {
    return new TextNode(this.nodeValue);
  }
  toString() {
    return this.nodeValue;
  }
}

const fakeDocument = {
  createElement(nodeName) {
    return new Element(nodeName);
  },
  createTextNode(nodeValue) {
    return new TextNode(nodeValue);
  }
};

exports.document = fakeDocument;
