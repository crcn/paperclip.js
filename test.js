const { components, VirtualElement, Hydrator, Binding, createTemplate } = require('./dist/paperclip6');



const template = createTemplate(function(element, textNode) {
  return element('div', {
    class: function(context) {
      return context.name;
    }
  }, [element('repeat', { each: (({ items }) => items || []), }, [textNode(function(number) {
    return number;
  })]), element('span')]);
}, {
  document,
  components
});

const view = template.createView();
view.update({ text: 'blarg' });
console.log(view.node.toString());
view.update({ text: 'blarg', name: 'test', items: [1, 2, 3] });
console.log(view.node.toString());
view.update({ text: 'blarg', name: 'test', items: [1, 2, 3, 4] });
console.log(view.node.toString());
view.update({ text: 'blarg', name: 'test', items: [3, 2, 1] });
console.log(view.node.toString());