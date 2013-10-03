Paperclip is a data-bindable templating system inspired by [Mustache](https://github.com/janl/mustache.js/), [Angular](http://angularjs.org/), [Derby](http://derbyjs.com/), and [Knockout](http://knockoutjs.com/).


### Installation

```
npm install paperclip -g
```

### Example

`hello-world.pc`

```html
{{message}}!
```

Terminal:

```bash
paperclip -i ./hello-world.pc -o ./hello-world.pc.js
```

Node.js:

```javascript
var pc = require("paperclip"),
fs = require("fs"),
pc.template(fs.readFileSync("./hello-world.pc", "utf8"));

var info = pc.bind({
  message: "Hello World"
});

console.log(String(info)); //Hello World!
```




