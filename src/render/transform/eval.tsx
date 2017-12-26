// import peg from './peg-parser'
import Node from '../../node'
import { Map } from 'immutable'
import * as _ from 'lodash'
import * as linear from './linear'

const peg = require('./peg-parser')

// import hull from './hull'
// import cut from './cut'
// import wall from './wall'

// const nonlinear = {
//   hull,
//   cut,
//   wall
// }

function transformReducer(node: Node, method, args, options): Node {

    let func
    if (func = linear[method]) {

        return func(node, args, options)

    } else if (func = nonlinear[method]) {

        return func(node, args, options)

    } else {
        // not a valid method, do nothing
        // TODO: provide some warning
        return node
    }

}

export default function transformEval(node: Node, expression: string): Node {
    
    let blocks = []
    try {
        blocks = peg.parse(expression)
    } catch (error) {
        // TODO: handle errors
        throw error
    }

    // console.log('blocks', blocks)
    const env0 = Map({
        node,
        selectors: '*',
        reverse: false
    })
    //
    const result = _.reduce(blocks, (env, block) => {

        const { method, args } = block
        const updateEnv = (env) => {
            if (method === 'select') {
                return env.set('selectors', args)
            } else {
                return env
            }
        }
        const options = {
            selectors: env.get('selectors'),
            reverse: env.get('reverse')
        }
        // $FlowFixMe
        const nextState = transformReducer(env.get('node'), method, args, options)
        return updateEnv(env.set('node', nextState))

    }, env0)

    // $FlowFixMe
    return result.get('node')
}
