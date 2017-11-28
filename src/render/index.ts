import { call, put } from 'redux-saga/effects'

import { DomNode } from '../dom'
import Node from '../node'

import { actionCreators } from '../actions'

function commit(node: Node) {
    return put(actionCreators.commit(node))
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

// class UnitRenderer extends Renderer<UnitProps> {

//     render() {

//         const props = this.props

//         return function* () {
//             //this.props.
//             // props.size
         
//             // yield commit(node)
//         }
//     }
    
// }

import renderUnit from './unit'

function* renderGeometry(node: Node, props: GeometryProps, domNode: DomNode) {
    
    // node.props
    console.log('render geometry')

    yield commit(node)
}

function* renderGroup(node: Node, props: GroupProps, domNode: DomNode) {
    
        // node.props
    
    // yield render(commit(node)
    // const domNode = {

    // }    

    console.log('props', props)

    if (props.tagName) {
        node = node.setTagName(props.tagName)
    }

    yield commit(node)

    console.log('node', node)

    console.log('render group', domNode.children)
    
    let i = 0
    while ( i < domNode.children.length) {        

        yield call(render1, node.child(i), domNode.children[i])

        i = i + 1
        // yield call(render1, node.child(1), domNode.children[1])
    }
    // }
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

    // yield select(s => s)
    // node.createChild();
    
    console.log('render', domNode)//, tagName)
    
    const tagName = domNode.name
    
    node = node.setTagName(tagName)
    // console.log('node', node, node.tagName)    

    yield commit(node)

    const props = domNode.attribs

    if (tagName === 'craftml-unit') {

        yield renderUnit(node, {size: 10}, domNode)
    
    } else if (tagName === 'craftml-group') {

        yield renderGroup(node, props as GroupProps, domNode)

    } else if (tagName === 'craftml-geometry') {
        
        yield renderGeometry(node, {geometry: 3}, domNode)
    }        

    // yield put({type: 'hello'})
    // return node
}