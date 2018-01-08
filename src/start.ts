console.log('hello world')

import { renderAsync } from './engine'
import * as _ from 'lodash'
import * as fs from 'fs'
import parse from './parse'

async function foo() {
    const code = '<cube/>'
    const dom = parse(code)
    const node = await renderAsync(dom[0])
    node.pp()
}

foo()