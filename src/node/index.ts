import { Map, List } from 'immutable'
import * as _ from 'lodash'
import { Geometry, Matrix4 } from 'three'
import { createBox, Box } from './box'

export { Box }

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

interface NodeError {
    message: string
}

import query from '../query'
import pp from './pp'

export function createRoot(): Node {
    const rootState = Map() as NodeState;
    const state = rootState
    return new Node(state, rootState);
}

export default class Node {

    private _state: NodeState
    private _rootState?: NodeState    
    private _cachedLayout?: Box

    constructor(state: NodeState, rootState?: NodeState) {
        this._state = state
        this._rootState = rootState
    }

    get tagName(): string {
        return this._state.get('tagName', '') as string
    }

    get id(): string {       
        return (this._state.get('props', {}) as {id: string}).id
    }

    get className(): string {       
        return (this._state.get('props', {}) as {class: string}).class
    }

    get state(): NodeState {
        return this._state
    }

    get path(): Array<string> {
        return this._state.get('path', []) as string[]
    }

    get children(): Node[] {
        return (this._state.get('children', Map()) as Map<string, NodeState>)
            .toArray().map(c => new Node(c)) as Node[]
    }

    get props(): {} {
        return this._state.get('props', {}) as {}
    }

    get style(): {} {
        return this._state.get('style', {}) as {}
    }

    setProps(obj: {}): Node {
        const newState = this._state.setIn(['props'], obj)
        return this.update(newState)
    }

    get merge(): boolean {            
        return (this._state.get('props', {}) as {merge: boolean}).merge || false 
    }

    get $() {
        return query(this)
    }

    get status(): string {
        return this._state.get('status', 'unknown') as string
    }

    setStatus(status: string) {
        const newState = this._state.set('status', status) as NodeState
        return this.update(newState)
    }

    get geometry(): Geometry | undefined {
        if (this._state.hasIn(['shape', 'geometry'])) {
            return this._state.getIn(['shape', 'geometry'])
        } else {
            return undefined
        }
    }

    setGeometry(geometry: Geometry): Node {
        const newState = this._state.setIn(['shape', 'geometry'], geometry)
        return this.update(newState)
    }

    get dimensions(): number {
        return this._state.getIn(['shape', 'dimensions'], 0)
    }

    setDimensions(dimensions: number = 3): Node {
        const newState = this._state.setIn(['shape', 'dimensions'], dimensions)
        return this.update(newState)
    }

    get matrix(): Matrix4 {
        return this._state.getIn(['shape', 'matrix'], new Matrix4())
    }

    setMatrix(matrix: Matrix4): Node {
        const newState = this._state.setIn(['shape', 'matrix'], matrix)
        return this.update(newState)
    }

    applyMatrix(matrix: Matrix4): Node  {
        const m = new Matrix4().copy(matrix).multiply(this.matrix)
        const newState = this._state.setIn(['shape', 'matrix'], m)
        return this.update(newState)
    }

    child(index: number): Node {
        const key = '' + index as string
        const childPath = [...this.path, key]
        const childNode = Map({ path: childPath })
        const childState = this._state.get(key, childNode) as NodeState
        return new Node(childState, this._rootState)
    }

    descendant(path: string[]): Node {
        const impath = IMPATH(path)
        const descendantState = this._state.getIn(impath)
        return new Node(descendantState, this._rootState)
    }

    setTagName(tagName: string): Node {
        const newState = this._state.set('tagName', tagName) as NodeState
        return this.update(newState)
    }

    setSubtree(subtree: Node) {
        // const impath = IMPATH(subtree.path)
        const relativePath = _.slice(subtree.path, this.path.length)
        const impath = _.reduce(relativePath, (ret: string[], e, i) => {
          ret.push('children')
          ret.push(e)
          return ret
        },                      [])
        // console.log('impath', impath, 'state', this._state.toJS())
        const newState = this._state.setIn(impath, subtree.state)
        return this.update(newState)
    }

    pp(): void {
        pp(this)
    }

    get layout(): Box {
        if (!this._cachedLayout) {
          this._cachedLayout = createBox(this)
        }
        return this._cachedLayout
    }

    get errors(): NodeError[] {
        return (this._state.get('errors', List<NodeError>()) as List<NodeError>).toArray()
    }

    pushError(err: NodeError): Node {
        const newState = this._state.update('errors', List<NodeError>(), (l: List<NodeError>) => l.push(err))
        return this.update(newState)
    }

    translate(x: number, y: number, z: number): Node {
        const m = new Matrix4().makeTranslation(x, y, z)
        return this.applyMatrix(m)
    }
    
    private update(newState: NodeState): Node {
        return new Node(newState)
    }
}