// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import App from './App';

// it('test 123', () => {
//   const x = 3
//   expect(x).toEqual(3)
// })

import Engine from './engine'

it('renders without crashing', async () => {
  // const div = document.createElement('div');
  // ReactDOM.render(<App />, div);
  // console.log('hello')
  const engine = new Engine()

  const unit = {
    type: 'tag', 
    name: 'craftml-unit', 
    attribs: {}, 
    children: []
  }

  const group = {
    type: 'tag', 
    name: 'craftml-group', 
    attribs: {}, 
    children: [unit, unit, unit]
}

  await engine.render(group)
  // node.pp()
});
