// interface NodeState {
//     get() : string
// }

import { Map } from 'immutable'
import * as _ from 'lodash'

const IMPATH = (p: Array<string>) =>  
    _.reduce(
        p, 
        (ret: Array<string>, e, i) => {
            ret.push('children')
            ret.push(e)
            return ret
        },                                           
        [])

type NodeState = Map<string, {}>

interface Box {

}

import pp from './pp'

export function createRoot(): Node {
    const rootState = Map() as NodeState;
    const state = rootState
    return new Node(state, rootState);
}

export default class Node {
    
    private _state: NodeState
    private _rootState?: NodeState
    // private _cachedLayout?: Box

    constructor(state: NodeState, rootState?: NodeState) {
        this._state = state
        this._rootState = rootState
    }    

    get tagName(): string {
        return this._state.get('tagName', '') as string
    }

    get state(): NodeState {
        return this._state
    }

    get path(): Array<string> {
        return this._state.get('path', []) as Array<string>
    }

    get children(): Array<Node> {        
        return (this._state.get('children', Map()) as Map<string, NodeState>)
            .toArray().map(c => new Node(c)) as Array<Node>
    }

    child(index: number): Node {
        const key = '' + index as string
        const childPath = [...this.path, key]
        const childNode = Map({path: childPath})
        const childState = this._state.get(key, childNode) as NodeState
        return new Node(childState, this._rootState)
    }

    setTagName(tagName: string): Node {
        const newState = this._state.set('tagName', tagName) as NodeState        
        return this.update(newState)
    }

    setSubtree(subtree: Node) {
        const impath = IMPATH(subtree.path)
        // console.log('impath', impath, 'state', this._state.toJS())
        const newState = this._state.setIn(IMPATH(subtree.path), subtree.state)
        return this.update(newState)
    }

    pp(): void {
        pp(this)
    }

    private update(newState: NodeState): Node {
        return new Node(newState)
    }

    // get id(): string {    
    //     return this._state.get('props',{})['id'] as string
    // }

    // get merge(): boolean {            
    //     return this._state.get('props',{})['merge'] as boolean || false 
    // }
    
}