import { Map, List } from 'immutable'
import * as _ from 'lodash'
import { Geometry, Matrix4 } from 'three'
import { createBox, Box } from './box'
import * as css from '../render/css'
import * as invariant from 'invariant'
import { createAdapter } from '../query/createAdapter';
import { DomNode } from '../dom'

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

import query from '../query'
import pp from './pp'

import { Part } from '../render/part'

// tslint:disable-next-line:no-any
type Context = Map<string, any>

interface ContentBlock {
    children: DomNode[],
    context: Context
}

export default class Node {

    private _state: NodeState
    private _root?: Node
    private _cachedLayout?: Box

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

    get props(): { style?: {} } {
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
    setContext(obj: Map<string, any>): Node {
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
        return new Node(childState, this._root)
    }

    descendant(path: string[]): Node {
        const impath = IMPATH(path)
        const descendantState = this._state.getIn(impath)
        return new Node(descendantState, this._root)
    }

    setTagName(tagName: string): Node {
        const newState = this._state.set('tagName', tagName) as NodeState
        return this.update(newState)
    }

    setSubtree(subtree: Node) {
        // const impath = IMPATH(subtree.path)
        const relativePath = _.slice(subtree.path, this.path.length)
        const impath = IMPATH(relativePath)
        // const impath = _.reduce(relativePath, (ret: string[], e, i) => {
        //     ret.push('children')
        //     ret.push(e)
        //     return ret
        // }, [])
        // // console.log('impath', impath, 'state', this._state.toJS())
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

    setBlock(block: ContentBlock): Node {
        const newState = this._state.set('block', block)
        return this.update(newState)
    }

    get block(): ContentBlock | null {
        return this._state.get('block', null) as ContentBlock | null
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
        const newState = this._state.update(
            'parts',
            Map<string, Part>(),
            s => (s as Map<string, Part>).set(name, part))
        return this.update(newState)
    }

    getPart(name: string): Part | null {
        if (this._state.hasIn(['parts', name])) {
            return this._state.getIn(['parts', name]) as Part
        } else {
            return null
        }
    }

    // 
    // CSS
    //

    get styleSheets(): List<css.StyleSheet> {
        return this._state.get('stylesheets', List<css.StyleSheet>()) as List<css.StyleSheet>
    }

    addStyleSheet(stylesheet: css.StyleSheet): Node {
        const newState = this._state.update(
            'stylesheets',
            List<StyleSheet>(),
            s => (s as List<css.StyleSheet>).push(stylesheet)) as NodeState
        return this.update(newState)
    }

    setStyleSheets(styleSheets: css.StyleSheet[]): Node {
        const newState = this._state.set('stylesheets', styleSheets)
        return this.update(newState)
    }

    computeStyle(): Node {

        if (this.parent && this.root) {

            // select rules from all inherited style sheets
            //            
            const selectedCssRules = _.flatten(this.styleSheets.map(stylesheet => {

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
        return new Node(newState)
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
