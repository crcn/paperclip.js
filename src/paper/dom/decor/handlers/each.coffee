bindable = require "bindable"

class Element
  
  ###
  ###

  constructor: (@el, @item, idKey, value) ->
    @[idKey] = value


class Handler extends require("./base")
  
  ###
  ###

  traverse: false

  ###
  ###

  init: () ->
    super()

    @$element = $(@element)
    @tpl = @$element.html()
    @$element.html ""
    @_source = new bindable.Collection()
    @_watchSource()

    @clip.bind("each").to @_change


  ###
  ###

  _change: (value) =>
    @_source.reset value

  ###
  ###

  _watchSource: () ->

    @_source.transform().map (item) =>
      el = $("<div>#{@tpl}</div>")
      new Element el, { item: item }, @_source._id(), item[@_source._id()]

    @_source.bind {
      insert: @_insertElement,
      remove: @_removeElement
    }

  ###
  ###

  _insertElement: (element) =>
    @$element.append element.el
    @dom.attach element.item, element.el

  ###
  ###

  _removeElement: (element) =>
    element.el.remove()


module.exports = Handler