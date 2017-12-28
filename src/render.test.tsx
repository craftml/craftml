import Engine from './engine'
import * as _ from 'lodash'

function registerRecursively(input: {}, path: string[], func: (map: {}) => void) {

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
  group: null,
  'css-select': null,
  primitives: {
    cube: null,
    cylinder: null
  },
  transform: {
    position: null,
    translate: null,
    center: null,
    fit: null,
    rotate: null,
    scale: null,
    land: null,
    orbit: null,    
  },
  layout: {
    flow: null,
    align: null,
    center: null
  }
}

const engine = new Engine()

describe('engine', () => {

  registerRecursively(cases, [], (f: string) => engine.registerTestSuite(f, describe, it))

})
