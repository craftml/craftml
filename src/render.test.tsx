import { renderAsync } from './engine'
import * as _ from 'lodash'
import * as fs from 'fs'
import parse from './parse'

function registerTestSuite(filename: string) {// , describe, it) {

  const content = fs.readFileSync(filename, 'utf8')
  const parsed = parse(content, {})

  describe(filename, () => {

      _.forEach(parsed, (p, k) => {

          if (p.name === 'test' && p.attribs && p.attribs.title !== 'undefined') {

              const title = filename + '>' + p.attribs.title

              it(title, async () => {

                  const node = await renderAsync(p)
                             
                  const errors = node.children[1].errors      

                  if (errors.length > 0) {
                      throw errors[0].message
                  }

              })

          }

      })

  })

}

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

import cases from './cases'

describe('engine', () => {

  registerRecursively(cases, [], (f: string) => registerTestSuite(f))

})
