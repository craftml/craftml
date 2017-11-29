import { call, put, select } from 'redux-saga/effects'

import { DomNode } from '../dom'
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
    geometry: Geometry,
    dimensions: number
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
import { Geometry } from 'three';

function* renderGeometry(node: Node, props: GeometryProps, domNode: DomNode) {
    
    const { geometry, dimensions } = props 

    node = node.setGeometry(geometry).setDimensions(dimensions)
    
    yield commit(node)
}

function* renderGroup(node: Node, props: GroupProps, domNode: DomNode) {

    if (props.tagName) {
        node = node.setTagName(props.tagName)
    }

    yield commit(node)

    let i = 0

    const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
    const children = domNode.children.filter(isNonEmpty)

    while ( i < children.length) {        

        yield render(node.child(i), children[i])
        
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

//
// render effect
// 
export default function render(node: Node, domNode: DomNode) {
    return call(render1, node, domNode)
}
    
export function* render1(node: Node, domNode: DomNode): {} {

    const tagName = domNode.name
    
    node = node.setTagName(tagName)
    
    yield commit(node)

    const props = domNode.attribs

    if (tagName === 'craftml-unit') {

        yield renderUnit(node, props, domNode)
    
    } else if (tagName === 'craftml-group') {

        yield renderGroup(node, props as GroupProps, domNode)

    } else if (tagName === 'craftml-geometry') {
        
        yield renderGeometry(node, props, domNode)

    } else if (tagName === 'test') {
        
        yield renderTest(node, props, domNode)

    } else if (tagName === 'script') {

        yield renderScript(node, props, domNode)
    }     

    // yield put({type: 'hello'})
    // return node
}