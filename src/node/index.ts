import { Map, List } from 'immutable'
import * as _ from 'lodash'
import { Geometry } from 'three'
import { createBox, Box } from './box'
import * as css from '../render/css'
import * as invariant from 'invariant'
import { createAdapter } from '../query/createAdapter';
import { saveAs } from './io'

export { Box }

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
export { Query }

import pp, { pps, html } from './pp'

import normalizeMatrix from './normalizeMatrix';

import NodeContext from './context'
import NodeShape from './shape'

export default class Node {

    private _state: NodeState
    private _root?: Node
    private _cachedLayout?: Box
    // priv

    static createRoot(): Node {

        const rootState = Map({
            path: []
        }) as NodeState;
        const root = new Node(rootState)
        root._root = root
        return root
    }

    constructor(state: NodeState, root?: Node) {
        this._state = state
        this._root = root
    }

    // check equality between two nodes
    equals(node: Node) {
        return this._state === node._state
    }

    //
    // A snapshot has a pointer to the root node of a state tree this node 
    // is attached to.
    //
    // Each time a mutate method is called, a derivative is returned. This derivative 
    // does not have access to the root node, which means it is no longer attached
    // to a state tree.
    //     

    isSnapshot() {
        return this._root
    }

    hasParent() {
        return this._root && this.path.length > 0
    }

    get parent(): Node | undefined {

        if (this._root && this.path.length > 0) {

            const path = this.path
            if (path.length > 0) {
                const parentPath = _.slice(path, 0, path.length - 1)
                const impath = IMPATH(parentPath)
                const parentNodeState = this._root._state.getIn(impath)
                return new Node(parentNodeState, this._root)
            }
        }

        return undefined
    }

    get root(): Node | undefined {
        return this._root
    }

    // 
    // Getters & Mutaters
    //

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
            .toArray().map(([key, c]) => new Node(c, this._root)) as Node[]
    }

    get childrenCount(): number {
        const childrenMap = this._state.get('children', Map()) as Map<string, NodeState>
        return childrenMap.size
    }

    get props(): { style?: {} } {
        return this._state.get('props', {}) as {}
    }

    get style(): {} {
        return this._state.get('style', {}) as {}
    }

    setStyle(style: {}) {
        const newState = this._state.set('style', style)
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

    get should() {
        return query(this)(this).should
    }

    get status(): string {
        return this._state.get('status', 'unknown') as string
    }

    setStatus(status: string) {
        const newState = this._state.set('status', status) as NodeState
        return this.update(newState)
    }

    get shape(): NodeShape {
        return this._state.get('shape', new NodeShape()) as NodeShape
    }

    updateShape(updater: (c: NodeShape) => NodeShape): Node {
        const newState = this._state.update('shape', new NodeShape(), updater)
        return this.update(newState)
    }

    normalizeMatrix(): Node {
        return normalizeMatrix(this)
    }

    child(index: number): Node {
        const key = '' + index as string
        const childPath = [...this.path, key]
        const childNode = Map({ path: childPath })
        const childState = this._state.get(key, childNode) as NodeState
        return new Node(childState, this._root)
    }

    newChild(): Node {
        const lastChildIndex = this.childrenCount
        return this.child(lastChildIndex)
    }

    descendant(path: string[]): Node {
        const impath = IMPATH(path)
        const descendantState = this._state.getIn(impath)
        return new Node(descendantState, this._root)
    }

    addGeometryNode(geometry: Geometry): Node {
        const newChildIndex = '' + this.childrenCount
        const absPath = [...this.path, newChildIndex]
        const relativePath = [newChildIndex]
        const geometryNodeState = Map({
            path: absPath
        })
        const newState = this._state.updateIn(
            IMPATH(relativePath),
            geometryNodeState,
            s => new Node(s)
                .setTagName('craftml-geometry')
                .updateShape(sp => sp.setGeometry(geometry).setDimensions(3))                
                .setProps({})
                .setStyle(this.style)               
                .state)
        return this.update(newState)
    }

    setTagName(tagName: string): Node {
        const newState = this._state.set('tagName', tagName) as NodeState
        return this.update(newState)
    }

    setSubtree(subtree: Node) {        
        const relativePath = _.slice(subtree.path, this.path.length)
        const impath = IMPATH(relativePath)
        const newState = this._state.setIn(impath, subtree.state)
        return this.update(newState)
    }

    deleteSubtree(subtree: Node): Node {
        const relativePath = _.slice(subtree.path, this.path.length)
        const newState = this._state.deleteIn(IMPATH(relativePath))
        return this.update(newState)
    }

    pp(): void {
        pp(this)
    }

    pps(): string {
        return pps(this)
    }

    html(): string {
        return html(this)
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
    
    // src, dest must be a descendent of this node
    copyDescendent(src: Node, dest: Node): Node {

        const srcImmutablePath = IMPATH(src.path, this.path)
        const destImmutablePath = IMPATH(dest.path, this.path)
        const _destNodeState = updatePath(this._state.getIn(srcImmutablePath), dest.path)
        const newState = this._state.setIn(destImmutablePath, _destNodeState)
        // console.log('dest', _destNodeState)
        return this.update(newState)
    }

    get context() {
        return this._state.get('context', new NodeContext()) as NodeContext
    }

    updateContext(updater: (c: NodeContext) => NodeContext): Node {
        const newState = this._state.update('context', new NodeContext(), updater)
        return this.update(newState)
    }

    // 
    // io
    //     
    saveAs(filename: string) {
        saveAs(this, filename)
    }

    // 
    // CSS
    //

    computeStyle(): Node {

        if (this.parent && this.root) {

            // select rules from all inherited style sheets
            //            
            const selectedCssRules = _.flatten(this.context.styleSheets.map(stylesheet => {

                return _.filter(stylesheet.rules, rule => this.isSelectedBy(rule.selectors.join(',')))

            }).toArray())

            // inline style
            //
            // e.g.,
            //
            // <foo style="color: brown"/>
            // -> * {color: brown}
            //
            const inlineStyleText = `* { ${this.props.style || ''} }`

            const inlineCssRules = css.parse(inlineStyleText).stylesheet.rules

            const applicableCssRules = [...selectedCssRules, ...inlineCssRules]

            const style = computeStyleFromCssRules(applicableCssRules, this.parent.style)

            return this.update(this._state.set('style', style))
            // console.log('applicableRules', this.tagName, selectedCssRules.length, style)
        }

        return this

    }

    isSelectedBy(selectors: string): boolean {
        invariant(
            this._root,
            'can not check for css selection because the node is not attached to the main tree')

        if (this._root) {
            const adapter = createAdapter(this._root)
            return css.is(this, selectors, { adapter })
        } else {
            return false
        }
    }

    private update(newState: NodeState): Node {   
        if (this._root === this) {
            // if this node itself is a root node
            // then the mutated node is still rooted
            const newNode = new Node(newState)
            newNode._root = newNode
            return newNode
        } else {
            // it is not rooted
            return new Node(newState)              
        }
    }

}
//
// helpers
//

// update a given node's path to 'destPath', and recursively update all the
// descendes of this node's path to match
function updatePath(nodeState: NodeState, destPath: string[]): NodeState {

    const _updateChild = (child: NodeState, index: string) => {
        const childDestPath = [...destPath, index]
        return updatePath(child, childDestPath)
    }

    return nodeState
        .set('path', destPath)
        .update('children', children => children ? (children as NodeState).map(_updateChild) : children)
}

function computeStyleFromCssRules(rules: css.CssRule[], parentStyle: {}) {

    let computedStyle = {}

    const setProperty = (decl: css.Declaration) => {

        let val

        if (decl.value === 'inherit' && parentStyle) {

            val = parentStyle[decl.property]

        } else {

            val = decl.value

        }

        if (decl.value === 'random' && decl.property === 'color') {
            // if parent's color is defined, use it
            // otherwise get a random color            
            // val = (parentStyle && parentStyle.get('color')) || getRandomColor()
        }

        if (val) {

            computedStyle[decl.property] = val

        }
    }

    _.forEach(rules, rule => {
        _.forEach(rule.declarations, decl => {
            setProperty(decl)
        })
    })

    // console.log('computedStyle', computedStyle)
    return computedStyle
}


// ref: https://www.typescriptlang.org/docs/handbook/mixins.html
// tslint:disable-next-line:no-any
// function applyMixins(derivedCtor: any, baseCtors: any[]) {
//     baseCtors.forEach(baseCtor => {
//         Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
//             derivedCtor.prototype[name] = baseCtor.prototype[name];
//         });
//     });
// }