import { DomNode } from '../../dom'
import Node from '../../node'
import * as _ from 'lodash'
import { Map } from 'immutable'

interface ParamAttribs {
    type: string,
    name: string,
    // tslint:disable-next-line:no-any
    value: any
}

//function evalParams(node: Node, props: {}, children: DomNode[]): Node{

import * as t from 'io-ts'

function extractProps(childrenNodes: DomNode[]) {

    const paramTags = _.filter(childrenNodes, c => c.type === 'tag' && c.name === 'param')

    let propTypesDef = {}
    let defaultProps = {}

    _.forEach(paramTags, (pt: DomNode) => {

        let paramAttribs = pt.attribs as ParamAttribs
        let paramName = paramAttribs.name || ''
        let paramValue = paramAttribs.value
        let paramType = paramAttribs.type

        if (paramType === 'number') {

            propTypesDef[paramName] = t.number
            defaultProps[paramName] = Number(paramValue)

        } else if (paramType === 'string') {
            
            propTypesDef[paramName] = t.string
            defaultProps[paramName] = '' + paramValue

        }
           
    })

    return {
        propTypes: t.interface(propTypesDef),
        defaultProps,
    }
}

import resolve from '../resolve'

export default function evalParams(node: Node, props: {}, children: DomNode[]): {} {

    const { propTypes, defaultProps } = extractProps(children)

    const context = node.context

    const resolvedProps = resolve(propTypes, props, defaultProps, context)

    // console.log('propTypes', propTypes)
    // console.log('defaultProps', defaultProps)
    // console.log('resolvedProps', resolvedProps)

    return resolvedProps
    // const paramTags = _.filter(domNode.children, c => c.type === 'tag' && c.name === 'param')

    // const contextSetters = _.map(paramTags, (pt: DomNode) => {

    //     let paramAttribs = pt.attribs as ParamAttribs
    //     let paramName = paramAttribs.name || ''
    //     let paramValue = paramAttribs.value
    //     let paramType = paramAttribs.type

    //     // does the user supply a param value
    //     if (_.has(props, paramName)) {
    //         // $FlowFixMe
    //         paramValue = props[paramName]
    //     }

    //     // check type
    //     if (paramType === 'number') {
    //         paramValue = Number(paramValue)
    //     }

    //     // console.log('set ', paramName, ' to ', paramValue)//, ' or ', userSuppliedValue)
    //     return (c: Map<string, {}>) => c.set(paramName, paramValue)
    // })

    // let context = node.context
    // context = _.flow(contextSetters)(context)

    // // console.log('new context', context)
    // return node.setContext(context)
}