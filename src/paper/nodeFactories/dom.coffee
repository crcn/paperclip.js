bindable = require "bindable"

class Section
	
	###
	###

	constructor: () ->

class DomFactory
	
	###
	###

	constructor: (@context) ->
		@internal = new bindable.Object()

	###
	###

	createElement: (name) -> document.createElement name

	###
	###

	createTextNode: (text) -> document.createTextNode text

	###
	###

	createFragment: () -> 
		frag = document.createDocumentFragment() 
		for child in arguments
			frag.appendChild child
		frag




module.exports = (context) -> new DomFactory context