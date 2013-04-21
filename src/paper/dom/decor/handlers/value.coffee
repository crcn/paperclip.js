class Handler extends require("./base")
  init: () ->
    @watcher.watch()
    @clip.bind("value").to @_onValueChange
    $(@element).bind "keyup change", @_onElementChange

  _onValueChange: (value) =>
    @element.value = @currentValue = value

  _onElementChange: (event) =>
    value = @element.value
    if @currentValue isnt value and (refs = @_bothWays()).length
      for refsByKey in refs
        for key of refsByKey
          refsByKey[key].value value

  _bothWays: () ->
    refs = []
    if @clip.options.bothWays
      refs.push @clip.options.bothWays

    refs

module.exports = Handler