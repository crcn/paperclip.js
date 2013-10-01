bdble = require "bindable"

allBindingClasses = {
  node: { }, # node shim
  attr: { 
    default: [
    ]
  }
}


class NodeBindingFactory

  ###
  ###

  getBindings: (options) ->

    bindings = []

    attributes = options.attributes
    nodeName   = options.nodeName
    node       = options.node

    bindables = [{
      name: nodeName
      key: nodeName
      value: node
      type: "node"
      node: node
    },
    {
      name: nodeName
      key: "default"
      value: node,
      type: "node"
      node: node
    }]


    context = undefined

    for attrName of attributes

      bindables.push 
        node: node
        name: attrName
        key: attrName
        value: attributes[attrName]
        type: "attr"

      bindables.push 
        node: node
        name: attrName
        key: "default"
        value: attributes[attrName]
        type: "attr"
    
    for bindable in bindables
      bindingClasses = allBindingClasses[bindable.type][bindable.key] or []
      for bindingClass in bindingClasses
        if bindingClass.prototype.test bindable

          unless context
            context = new bdble.Object()

          bindable.context = context
          
          bindings.push new bindingClass bindable

    bindings



  ###
  ###

  register: (name, bindingClass) ->

    type = bindingClass.type or bindingClass.prototype.type 

    unless /node|attr/.test String(type)
      throw new Error "node binding class \"#{bindingClass.name}\" must have a type 'node', or 'attr'"

    classes = allBindingClasses[type]

    unless bindingClass.prototype.test
      bindingClass.prototype.test = () -> true

    unless classes[name]
      classes[name] = []

    classes[name].push bindingClass

    @


nodeFactory = module.exports = new NodeBindingFactory()

defaultBindingClasses = {
  default: [
    require("./attrs/text")
  ],
  "data-bind": [
    dataBind = module.exports.dataBind = require("./attrs/dataBind")
  ]
}


for type of defaultBindingClasses
  classes = defaultBindingClasses[type]
  for clazz in classes
    nodeFactory.register type, clazz




