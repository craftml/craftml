import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { takeLatest, END } from 'redux-saga'
import { call, actionChannel, select } from 'redux-saga/effects'
import { DomNode } from './dom'

import { COMMIT, UPDATE, Actions } from './actions'
import * as _ from 'lodash'

import Node from './node'

export type RootAction = Actions[keyof Actions]

const reducer = (state: Node, action: RootAction) => {

    switch (action.type) {
        case COMMIT:
            if (state) {
                const { node } = action.payload
                return state.setSubtree(node)
            } else {
                return action.payload.node
            }
        
        case UPDATE:
            const { node, updateFunc } = action.payload            
            const newNode = updateFunc(state.descendant(node.path))
            return state.setSubtree(newNode)        

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
    
    const dom = action.payload.dom
    let root = createRoot()
    // yield render(node, dom)
    yield render(root, dom)

    // node.pp()
    // const node = yield select(state => state)
    // node.pp()
}

// declare const channel: Channel<{foo: string}>;

function* engineSaga() {
    const requestChan = yield actionChannel('RENDER_REQUEST')
    yield takeLatest(requestChan, foo)
}

// dom = {}
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renderAsync(dom: DomNode) {

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

import * as fs from 'fs'
import parse from './parse'

export default class Engine {

    public async render(dom: DomNode) {
        return await renderAsync(dom)
    }

    registerTestSuite(filename: string, describe, it) {

        const content = fs.readFileSync(filename, 'utf8')
        const parsed = parse(content, {})

        describe(filename, () => {

            _.forEach(parsed, (p, k) => {

                if (p.name === 'test') {

                    const title = filename + '>' + p.attribs.title

                    it(title, async () => {

                        const node: Node = await renderAsync(p)
                        // node.pp()
                        
                        const errors = node.children[1].errors                        
                        if (errors.length > 0) {
                            throw errors[0].message
                        }

                    })

                }

            })

        })

    }

}
