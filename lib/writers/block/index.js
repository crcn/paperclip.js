var createSection = require("document-section"),
utils = require("../../utils"),
ValueBinding = require("./bindings/value"),
UnboundValueBinding = require("./bindings/unboundValue"),
createScript = require("../../script");


function writeUnboundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new UnboundValueBinding(script, node))
    }
  });
}

function writeBoundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new ValueBinding(view, this.script, node));
    }
  });
}

function writeValue (template, nodeFactory, block) {

  var node = nodeFactory.createTextNode(""),
  script   = createScript(block.value);

  if (block.value.refs.length === 0) {
    writeUnboundValue(template, node, script);
  } else {
    writeBoundValue(template, node, script);
  }

  return node;
}

function writeDynamic (template, nodeFactory, blockBindingFactory, scripts, contentPaper, childPaper) {

  var section = createSection(nodeFactory),
  scriptName  = Object.keys(scripts)[0],
  contentTemplate = contentPaper ? template.create(contentPaper) : void 0,
  childTemplate = childPaper ? template.create(childPaper) : void 0;

  // TODO - allow multiple scripts?
  var script = createScript(scripts[scriptName]);

  template.clips.push({
    section: section,
    script: script,
    contentTemplate: contentTemplate,
    childTemplate: childTemplate,
    nodeFactory: nodeFactory,
    initialize: function () {
      this.startNodePath     = utils.getNodePath(this.section.start);
      this.endNodePath       = utils.getNodePath(this.section.end);
      this.blockBindingClass = blockBindingFactory.getClass(scriptName);

      // TODO - throw error if binding class doesn't exist?
    },
    prepare: function (view) {
      var startNode = utils.getNodeByPath(view.node, this.startNodePath),
      endNode       = utils.getNodeByPath(view.node, this.endNodePath);
      var section   = createSection(this.nodeFactory, startNode, endNode);

      // binding class might not exist. Don't continue
      if (this.blockBindingClass) {
        view.bindings.push(new this.blockBindingClass(view, this.script, section, this.contentTemplate, this.childTemplate));
      }
    }
  });

  return section.render();
}

module.exports = function (template) {

  var nodeFactory      = template.application.nodeFactory,
  blockBindingFactory  = template.paperclip.blockBindingFactory;

  return function (script, contentPaper, childPaper) {

    // only {{ value }} block. MUCH faster.
    if (script.value && Object.keys(script).length === 1) {
      return writeValue(template, nodeFactory, script);
    }

    // more complicated stuff that would require a section of elements. might be
    // something like {{ html: block}}, or {{#if:condition}}content{{/}}
    return writeDynamic(template, nodeFactory, blockBindingFactory, script, contentPaper, childPaper);
  };
};