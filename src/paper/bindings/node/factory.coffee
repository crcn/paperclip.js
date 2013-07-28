allBindingClasses = {
  node: { }, # node shim
  attr: { 
    default: [
    ]
  }, # attr shim

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
        if bindingClass.test bindable.value
          bindings.push new bindingClass bindable



    bindings



  ###
  ###

  register: (name, bindingClass) ->

    unless /node|attr/.test String(bindingClass.type)
      throw new Error "node binding class \"#{bindingClass.name}\" must have a type 'node', or 'attr'"

    classes = allBindingClasses[bindingClass.type]

    unless bindingClass.test
      bindingClass.test = () -> true

    unless classes[name]
      classes[name] = []

    classes[name].push bindingClass

    @


nodeFactory = module.exports = new NodeBindingFactory()


nodeFactory.register "default", require("./attrs/text")


