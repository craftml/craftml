import Node from '../node'
import { actionCreators } from '../actions'
import { put, select } from 'redux-saga/effects'

export function commit(node: Node) {
    return put(actionCreators.commit(node))
}

export function refresh(node: Node) {
    return select(state => (state as Node).descendant(node.path))
}