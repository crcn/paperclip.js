Base  = require "./base"
decorFactory = require("../decor/blockFactory")
Clip = require "../../clip"

# loops through a collection of models
# {{#each:people}}
# {{/}}


class BlockChild extends require("./base")
  
  ###
  ###

  constructor: (@block, @with) ->
    super()
    @content = @block.contentFactory()

  ###
  ###

  bind: () ->
    super()
    @content.bind()
    @

  ###
  ###

  dispose: () ->
    super()
    @content.dispose()
    @


  ###
  ###

  load: (context) ->
    return super context if not @with
    super context.child(@with)

  ###
  ###

  _loadChildren: (context) ->
    @content.load context

class BlockBinding extends require("./base")
  
  ###
  ###

  name: "block"

  ###
  ###

  constructor: (@script, @contentFactory, @childBinding) ->
    super()
    @clip = new Clip { script: script, watch: false }
    @_decor = decorFactory.getDecor @

  ###
  ###

  bind: () -> 
    super()
    @clip.watch()
    @_decor.bind()

  ###
  ###

  dispose: () ->
    @clip.dispose()
    @_decor.dispose()
    super()

  ###
  ###

  createContent: (wth) -> new BlockChild @, wth

  ###
  ###

  replaceAll: () ->   


    # create a fragment out of all the nodes to place
    @node = newFragment = if arguments.length > 1 then @paper.nodeFactory.createFragment(arguments...) else arguments[0]

    firstNode = @nodes[0]
    
    oldNodes = @nodes
    @nodes = arguments


    # not added to the DOM? ignore the rest! 
    return unless firstNode.parentNode

    # otherwise add the fragment
    firstNode.parentNode.insertBefore newFragment, firstNode

    # and remove the rest of the elements
    for rmNode in oldNodes
      rmNode.parentNode.removeChild rmNode





  ###
  ###

  load: (context) ->
    @clip.reset context
    @clip.update()
    super context

  ###
  ###

  _loadChildren: (context) ->
    @_decor.load context

  ###
  ###

  clone: () -> new BlockBinding @script, Base.cloneEach @children

  ###
  ###

  createNode: (nodeFactory) -> 
    node = nodeFactory.createComment "block"
    @nodes = [node]
    node

  
module.exports = BlockBinding