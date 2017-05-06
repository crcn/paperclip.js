const {document} = require('./utils');
const {createTemplate} = require('../core');
const assert = require('assert');

describe(__filename + '#', () => {
  it('can render a text node', () => {
    const {createView} = createTemplate((element, text) => text('hello'), { document });
    const view = createView();
    assert.equal(view.toString(), 'hello');
  });
  it('can create an element', () => {
    const {createView} = createTemplate((element, text) => element('span', null, text('hello')), {document});
    assert.equal(createView().toString(), '<span>hello</span>');
  });

  it('can create an element with attributes', () => {
    const {createView} = createTemplate((element) => (
      element('span', { style: 'color: red;' })
    ), {document});

    assert.equal(createView().toString(), '<span style="color: red;"></span>');
  });

  it('can create a text binding', () => {
    const {createView} = createTemplate((element, text) => (
      element('span', null, text('hello '), text(({name}) => name))
    ), {document});

    assert.equal(createView({name: 'craig'}).toString(), '<span>hello craig</span>');
  });

  it('can create an attribute binding', () => {
    const {createView} = createTemplate((element, text) => (
      element('span', {
        style: ({style}) => style
      })
    ), {document});
    
    assert.equal(createView({ style: `color: blue;`}).toString(), '<span style="color: blue;"></span>');
  });
});