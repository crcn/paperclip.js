bindable = require "bindable"

class Section
	
	###
	###

	constructor: () ->

class DomWriter
	
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

	createFragment: () -> document.createDocumentFragment() 




module.exports = (context) -> new DomWriter context