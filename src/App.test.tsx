// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import App from './App';

// it('test 123', () => {
//   const x = 3
//   expect(x).toEqual(3)
// })

import Engine from './engine'
import parse from './parse'
import * as fs from 'fs'
import * as _ from 'lodash'

const code = `<craftml-group><craftml-unit/><craftml-unit/></craftml-group>`

function registerRecursively(input, path, func) {

  if (input === null) {

    const testFilePath = `./test/${path.join('/')}.html`

    func(testFilePath)

  } else {

    _.forEach(input, (child, key) => {

      registerRecursively(child, [...path, key], func)

    })

  }

}

const cases = {
  unit: null,
  group: null
}

const engine = new Engine()

describe('engine', () => {

  registerRecursively(cases, [], (f) => engine.registerTestSuite(f, describe, it))

})

// it('renders without crashing', async () => {
//   // const div = document.createElement('div');
//   // ReactDOM.render(<App />, div);
//   // console.log('hello')
//   // const engine = new Engine()

//   // const unit = {
//   //   type: 'tag', 
//   //   name: 'craftml-unit', 
//   //   attribs: {}, 
//   //   children: []
//   // }

//   // const group = {
//   //   type: 'tag', 
//   //   name: 'craftml-group', 
//   //   attribs: {}, 
//   //   children: [unit, unit, unit]
//   // }

//   // console.log(parse(code))

//   const content = fs.readFileSync('./test/unit.html', 'utf8')
//   // console.log('content', content)
//   const parsed = parse(content, {})
//   // console.log('parsed', parsed)

//   const root = parsed[0]// = parse(code)[0]

//   await engine.render(root)

//   // node.pp()
//   // console.log('done', done)
// });
