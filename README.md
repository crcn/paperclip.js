PaperclipJS is a tiny immutable virtual DOM library.

Example:

```javascript
const { createTemplate } from 'paperclip';

const template = createTemplate(element, textNode) {
  return element('div', {}, textNode(({ text }) => `hello ${text}!`)));
}, { document });


const view = template.createView();

document.body.appendChild(view.node);

view.update({ text: 'blarg' });
```
