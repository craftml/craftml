import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { END } from 'redux-saga'
import { actionChannel, takeLatest } from 'redux-saga/effects'
import { DomNode } from './dom'

import { COMMIT, UPDATE, Actions } from './actions'

import Node from './node'

export type RootAction = Actions[keyof Actions]

const reducer = (state: Node, action: RootAction) => {

    switch (action.type) {
        case COMMIT: {
            if (state) {
                const { node } = action.payload
                return state.setSubtree(node)                
            } else {
                return action.payload.node
            }
        }
        case UPDATE: {
            const { node, updateFunc } = action.payload
            const newNode = updateFunc(state.descendant(node.path))
            return state.setSubtree(newNode)            
        }
        default: return state;
    }
}

const sagaMiddleware = createSagaMiddleware()

import render from './render'
import { Map } from 'immutable'

interface RenderAction {
    payload: {
        dom: DomNode,
        params: object
    }
}

function* handleRenderRequest(action: RenderAction) {

    const dom = action.payload.dom
    const params = action.payload.params
    let root = Node.createRoot()
    root = root.updateContext(ctx => ctx.setParams(Map(params)))
    yield render(root, dom)
}

function* engineSaga() {
    const requestChan = yield actionChannel('RENDER_REQUEST')
    yield takeLatest(requestChan, handleRenderRequest)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function renderAsync(dom: DomNode, params: object = {}) {

    const store = createStore(
        reducer,
        applyMiddleware(sagaMiddleware)
    )
    sagaMiddleware.run(engineSaga)
    // console.log('renderAysnc')
    store.dispatch({ type: 'RENDER_REQUEST', payload: { dom, params } })

    // poll every 100 seconds
    let status = ''
    let count = 0
    // console.time('render')
    while (status !== 'done' && count < 10) {
        status = store.getState().status
        // console.log('status', store.getState().status)
        await sleep(100)
        // console.log('not yet')
        count++
    }
    // console.timeEnd('render')

    // end the saga
    store.dispatch(END)    

    return store.getState()
}

import parse from './parse'

export default class Engine {

    public async render(input: string | DomNode, params: object = {}) {

        let dom
        if (typeof input === 'string') {

            const parsed = parse(input, {})

            dom = parsed[0]

        } else {

            dom = input
        }

        return await renderAsync(dom, params)
    }

}
