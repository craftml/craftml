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

    // note: params should be a regular JS object (TODO: better type safety)
    const params = node.context1.params.toJS()

    // console.log('propTypes', propTypes)
    // console.log('defaultProps', defaultProps)
    // console.log('params', params)
    // console.log('props', props)

    const resolvedProps = resolve(propTypes, props, defaultProps, params)

    // console.log('resolvedProps', resolvedProps)
    return resolvedProps
}