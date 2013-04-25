###
  scans for bindings
###

class BindingScanner
  
  ###
   Resursively scans for bindable DOM elements, and finds the associated binding
  ###

  bind: (nodesById, currentElement) ->
    if currentElement.nodeName is "#comment" and currentElement.nodeValue.substr(0, 4) is "spc:"
      pcid = currentElement.nodeValue.substr(4)
      return if not (node = nodesById[pcid])
      node.bind @_boundElements pcid, currentElement.nextSibling, []

    for child in currentElement.childNodes
      @bind nodesById, child


  ###
   scans for all elements until the end binding block
  ###

  _boundElements: (pcid, currentElement, elements) ->

    if not currentElement or (currentElement.nodeName is "#comment" and currentElement.nodeValue is "epc:#{pcid}")
      return elements
    else
      elements.push currentElement
      return @_boundElements pcid, currentElement.nextSibling, elements




