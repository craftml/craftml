import Node from '../node'
import { DomNode } from '../dom'

import { actionCreators } from '../actions'
import { put, select, call } from 'redux-saga/effects'

import renderMain from './index'

export function commit(node: Node) {
    return put(actionCreators.commit(node))
}

export function refresh(node: Node) {
    return select(state => (state as Node).descendant(node.path))
}

export function render(node: Node, domNode: DomNode) {
    return call(renderMain, node, domNode)
}

export function update(node: Node, updateFunc: (a: Node) => Node) {
    return put(actionCreators.update(node, updateFunc))    
}