```javascript
var Paperclip = require("paperclip"),
BindableObject = require("bindable").Object;


var obj = new BindableObject({
  name: { 
    first: "Craig",
    last: "Blah"
  },
  input: $("input")
});

var clip = new Paperclip(obj, {
  
  //create a binding from the text input, to the first name, and vice versa
  "input": {
    attributes: {
      text: { to: "name.first", bothWays: true }
    }
  }
});
