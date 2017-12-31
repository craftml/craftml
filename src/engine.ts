import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { takeLatest, END } from 'redux-saga'
import { actionChannel } from 'redux-saga/effects'
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
import { createRoot } from './node'

interface RenderAction {
    payload: {
        dom: DomNode
    }
}

function* handleRenderRequest(action: RenderAction) {
    
    const dom = action.payload.dom
    let root = createRoot()    
    yield render(root, dom)
 }

function* engineSaga() {
    const requestChan = yield actionChannel('RENDER_REQUEST')
    yield takeLatest(requestChan, handleRenderRequest)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function renderAsync(dom: DomNode) {

    const store = createStore(
        reducer,
        applyMiddleware(sagaMiddleware)
    )
    sagaMiddleware.run(engineSaga)
    // console.log('renderAysnc')
    store.dispatch({ type: 'RENDER_REQUEST', payload: { dom } })

    // poll every 100 seconds
    let status = ''
    let count = 0
    while (status !== 'done' && count < 10) {
        status = store.getState().status
        // console.log('status', store.getState().status)////.get('status','')
        await sleep(100)
        // console.log('not yet')
        count++
    }

    // end the saga
    store.dispatch(END)

    return store.getState()
}

import parse from './parse'

export default class Engine {

    public async render(code: string) {

        const parsed = parse(code, {})
        
        const dom = parsed[0]

        return await renderAsync(dom)
    }

}
