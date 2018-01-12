import Node from '../../node'
import * as _ from 'lodash'
import * as linear from './linear'

const peg = require('./peg-parser')

import hull from './hull'
import cut from './cut'
import wall from './wall'

const nonlinear = {
  hull,
  cut,
  wall
}

function transformReducer(node: Node, method: string, args: {}, options: {selectors: string, reverse: boolean}): Node {

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

type Env = {
    node: Node,
    selectors: string,
    reverse: boolean
}

type Block = {
    method: string,
    args: string | {},
}

function reduceBlock(env: Env, block: Block): Env {

    const { method, args } = block

    if (method === 'select' && typeof args === 'string') {

        return {
            ...env,
            selectors: args
        }

    } else {

        const options = {
            selectors: env.selectors,
            reverse: env.reverse
        }

        return {
            ...env,
            node: transformReducer(env.node, method, args, options)
        }

    }

}

export default function transformEval(node: Node, expression: string): Node {

    let blocks: Block[] = []
    try {
        blocks = peg.parse(expression)
    } catch (error) {
        // TODO: handle errors
        throw error
    }

    const env0 = {
        node,
        selectors: '*',
        reverse: false
    }

    const result = _.reduce(blocks, reduceBlock, env0)

    return result.node    
}

export function transformEvalOld(node: Node, expression: string): Node {
    
    let blocks: Block[] = []
    try {
        blocks = peg.parse(expression)
    } catch (error) {
        // TODO: handle errors
        throw error
    }

    const env0 = {
        node,
        selectors: '*',
        reverse: false
    }
    
    const result = _.reduce(blocks, (env, block) => {

        const { method, args } = block

        const options = {
            selectors: env.selectors,
            reverse: env.reverse
        }

        env.node = transformReducer(env.node, method, args, options)

        const updateEnv = (e: Env) => {
            if (method === 'select') {
                return {
                    ...e,
                    selectors: args
                }
            } else {
                return e
            }        
        }

        return updateEnv(env)

    },                      env0)
    
    return result.node
}
