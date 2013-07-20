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

  unbind: () -> 
    super()
    #@content.unbind()

  ###
  ###

  unbind: () ->
    super()
    @content.unbind()
    @


  ###
  ###

  load: (paper) ->
    return super paper if not @with
    super paper.child(@with)

  ###
  ###

  _loadChildren: (paper) ->
    @content.load paper

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

  unbind: () ->
    @clip.unwatch()
    @_decor.unbind()
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

  load: (paper) ->
    @clip.reset paper.context
    @clip.update()
    super paper

  ###
  ###

  _loadChildren: (paper) ->
    @_decor.load paper.context

  ###
  ###

  clone: () -> new BlockBinding @script, Base.cloneEach @children

  ###
  ###

  createNode: (nodeFactory) -> 
    node = nodeFactory.createComment "block"
    @nodes = [node]
    node

  
module.exports = (script, contentFactory, childBinding) -> 
  new BlockBinding script, contentFactory, childBinding