import cases from '../cases'
import * as _ from 'lodash'

function registerRecursively(input: {}, path: string[], func: (map: {}) => void) {

    if (input === null) {

        // const testFilePath = `./test/${path.join('/')}.html`

        func(path)

    } else {

        _.forEach(input, (child, key) => {

            registerRecursively(child, [...path, key], func)

        })

    }
}

import * as fs from 'fs'
import parse from '../parse'

interface TestCase {
    title: string
}

interface TestSuite {
    filename: string
    path: string[]
    cases: TestCase[]
}

let suites: TestSuite[] = []

function registerTestSuite(path: string[]) {
    
    const filename = `./test/${path.join('/')}.html`

    const content = fs.readFileSync(filename, 'utf8')
    
    let parsed = parse(content, {})
    parsed = _.filter(parsed, p => p.name === 'test')

    const testCases: TestCase[] = _.map(parsed, p => ({
        title: p.attribs.title || ''
    }))

    const testSuite = {
        filename,
        path,
        cases: testCases        
    }
    suites.push(testSuite)
    return
}

// import axios from 'axios'

registerRecursively(cases, [], (f: string[]) => registerTestSuite(f))

console.log(JSON.stringify(suites, null, '  '))