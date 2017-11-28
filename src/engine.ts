import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { takeLatest } from 'redux-saga'
import { call, actionChannel, select } from 'redux-saga/effects'
import { DomNode } from './dom'

import { COMMIT, Actions } from './actions'

import Node from './node'
    
export type RootAction =  Actions[keyof Actions]

const reducer = (state: Node, action: RootAction ) => {
    
    switch (action.type) {
        case COMMIT:
            if (state) {                
                const { node } = action.payload
                return state.setSubtree(node)            
            } else {
                return action.payload.node
            }            
                  
        default: return state;
      }
}

const sagaMiddleware = createSagaMiddleware()

// interface Action {
//     payload: {
//         dom: DomNode
//     }
// }

import render from './render'
import { createRoot } from './node'

// function* bar(){
       
// }

// export const actionCreators = {
//     incrementCounter: createActionCreator('INCREMENT_COUNTER'),
//     showNotification: createActionCreator(
//       'SHOW_NOTIFICATION', (message: string, severity?: Severity) => ({ message, severity }),
//     ),
// }

interface RenderAction {
    payload: {
        dom: DomNode
    }
}

function* foo(action: RenderAction) {

    console.log('foo', action)
    // /
    const dom = action.payload.dom
    let root = createRoot()
    // yield render(node, dom)
    yield render(root, dom)

    // node.pp()
    const node = yield select(state => state)
    node.pp()
}

// declare const channel: Channel<{foo: string}>;

function* engineSaga() {    
    const requestChan = yield actionChannel('RENDER_REQUEST')
    yield takeLatest(requestChan, foo)
}

// dom = {}

async function renderAsync(dom: DomNode) {

    const store = createStore(
        reducer,
        applyMiddleware(sagaMiddleware)
    )
    sagaMiddleware.run(engineSaga)
    // console.log('renderAysnc')
    store.dispatch({type: 'RENDER_REQUEST', payload: {dom}})

    return 0
}

export default class Engine {

    public async render(dom: DomNode) {
        return await renderAsync(dom)
    }

}
