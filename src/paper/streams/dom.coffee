bindable = require "bindable"

class DomStream
	
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




module.exports = DomStream