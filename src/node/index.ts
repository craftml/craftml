import { Map, List } from 'immutable'
import * as _ from 'lodash'
import { Geometry, Matrix4 } from 'three'
import { createBox, Box } from './box'

export { Box }


// const IMPATH = (p: Array<string>) =>
//     _.reduce(
//         p,
//         (ret: Array<string>, e, i) => {
//             ret.push('children')
//             ret.push(e)
//             return ret
//         },
//         [])

const IMPATH = (p: Array<string>, root: string[] = []) => {

    const relativePath = _.slice(p, root.length)

    return _.reduce(
        relativePath,
        (ret: Array<string>, e, i) => {
            ret.push('children')
            ret.push(e)
            return ret
        },
        [])
}

export type NodeState = Map<string, {}>

export interface NodeError {
    message: string
}

import query, { Query } from '../query'
import pp from './pp'

import { Part } from '../render/part'

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
        return (this._state.get('props', {}) as { id: string }).id
    }

    get className(): string {
        return (this._state.get('props', {}) as { class: string }).class
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

    // tslint:disable-next-line:no-any
    get context(): Map<string, any> {
        // tslint:disable-next-line:no-any
        return this._state.get('context', Map()) as Map<string, any>
    }

    // tslint:disable-next-line:no-any
    setContext(obj: Map<string, any> ): Node {
        const newState = this._state.setIn(['context'], obj)
        return this.update(newState)
    }

    setProps(obj: {}): Node {
        const newState = this._state.setIn(['props'], obj)
        return this.update(newState)
    }

    get merge(): boolean {
        return (this._state.get('props', {}) as { merge: boolean }).merge || false
    }

    setMerge(m: boolean): Node {
        const newState = this._state.update('props', {}, props => ({ ...props, merge: m })) as NodeState
        return this.update(newState)
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

    applyMatrix(matrix: Matrix4): Node {
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
        }, [])
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

    // src, dest must be a descendent of this node
    copyDescendent(src: Node, dest: Node): Node {

        const srcImmutablePath = IMPATH(src.path, this.path)
        const destImmutablePath = IMPATH(dest.path, this.path)
        const _destNodeState = updatePath(this._state.getIn(srcImmutablePath), dest.path)
        const newState = this._state.setIn(destImmutablePath, _destNodeState)
        // console.log('dest', _destNodeState)
        return this.update(newState)
    }

    //
    // Parts
    //

    get parts(): Map<string, Part> {
        return this._state.get('parts', Map()) as Map<string, Part>
    }

    setParts(parts: Map<string, Part>) {
        const newState = this._state.set('parts', parts)
        return this.update(newState)
    }

    addPart(name: string, part: Part): Node {
        const newState = this._state.update('parts', Map(), s => (s as Map<string, {}>).set(name, part))
        return this.update(newState)
    }    

    getPart(name: string): Part | null {
        if (this._state.hasIn(['parts', name])) {
            return this._state.getIn(['parts', name]) as Part
        } else {
            return null
        }        
    }

    private update(newState: NodeState): Node {
        return new Node(newState)
    }
}



// helpers

// update a given node's path to 'destPath', and recursively update all the
// descendes of this node's path to match
const updatePath = (nodeState: NodeState, destPath: string[]): NodeState => {

    const _updateChild = (child: NodeState, index: string) => {
        const childDestPath = [...destPath, index]
        const childDestImmutablePath = [...destPath, 'children', index]
        return updatePath(child, childDestPath)
    }

    return nodeState
        .set('path', destPath)
        .update('children', children => children ? (children as NodeState).map(_updateChild) : children)
}

//   const copy = (state, src, dest) => {
//     const srcImmutablePath = src.getImmutablePath()
//     const destImmutablePath = dest.getImmutablePath()
//     // console.log('path', srcPath, destPath)
//     const _destNodeState = updatePath(state.getIn(srcImmutablePath), dest.path)
//     // console.log('dest', _destNodeState)
//     return state.setIn(destImmutablePath, _destNodeState)
//   }


