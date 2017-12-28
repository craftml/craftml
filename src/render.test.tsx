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
  transform: {
    position: null,
    translate: null
  },
  layout: {
    flow: null
  }
}

const engine = new Engine()

describe('engine', () => {

  registerRecursively(cases, [], (f: string) => engine.registerTestSuite(f, describe, it))

})
