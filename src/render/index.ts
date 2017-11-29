import { call, put, select } from 'redux-saga/effects'

import { React, DomNode, DOM } from '../dom'
import Node from '../node'

import { actionCreators } from '../actions'

function commit(node: Node) {
    return put(actionCreators.commit(node))
}

function refresh(node: Node) {
    return select(state => (state as Node).descendant(node.path))
}

export interface NodeProps {

}

export interface GeometryProps {
    geometry: number   
}    

export interface UnitProps extends NodeProps {
    size: number
}

export interface GroupProps extends NodeProps {
    merge: boolean,
    tagName?: string
}

import renderUnit from './unit'
import renderTest from './_test'
import renderScript from './script'

function* renderGeometry(node: Node, props: GeometryProps, domNode: DomNode) {
    
    // node.props
    console.log('render geometry')

    yield commit(node)
}

function* renderGroup(node: Node, props: GroupProps, domNode: DomNode) {
            

    if (props.tagName) {
        node = node.setTagName(props.tagName)
    }

    yield commit(node)

    // console.log('node', node)

    // console.log('render group', domNode.children)
    
    let i = 0

    // const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
    const children = domNode.children

    // let j = 0
    while ( i < children.length) {        

        yield call(render1, node.child(i), domNode.children[i])
        
        i = i + 1
        // yield call(render1, node.child(1), domNode.children[1])
    }
    // }

    node = yield refresh(node)
    // console
    // n1.pp()

    node = node.setStatus('done')
    yield commit(node)
    // yield call(render, node, domNode)
    // return node
}

export interface Renderer {
    saga: (node: Node, props: NodeProps, domNode: DomNode) => IterableIterator<{}>
}

const t: Renderer = {
    saga: renderGroup
} 

const s: Renderer = {
    saga: renderUnit
} 

// console.log(t)
// console.log(s)

export default function render(node: Node, domNode: DomNode) {
    return call(render1, node, domNode)
}
    
export function* render1(node: Node, domNode: DomNode) {

    const tagName = domNode.name
    
    node = node.setTagName(tagName)
    
    yield commit(node)

    const props = domNode.attribs

    if (tagName === 'craftml-unit') {

        yield renderUnit(node, {size: 10}, domNode)
    
    } else if (tagName === 'craftml-group') {

        yield renderGroup(node, props as GroupProps, domNode)

    } else if (tagName === 'craftml-geometry') {
        
        yield renderGeometry(node, {geometry: 3}, domNode)

    } else if (tagName === 'test') {
        
        yield renderTest(node, props, domNode)

    } else if (tagName === 'script') {

        yield renderScript(node, props, domNode)
    }     

    // yield put({type: 'hello'})
    // return node
}