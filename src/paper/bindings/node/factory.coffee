decorClasses = [
]


class NodeBindingFactory

  ###
  ###

  getBindings: (node) ->

    decor = []

    for decorClass in decorClasses  
      if decorClass.test node
        decor.push new decorClass



