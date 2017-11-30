import Node from '../node'
import { should } from './assert'
// import CSSselect from 'css-select'
const CSSselect = require('css-select')
import { createAdapter } from './createAdapter'
import * as _ from 'lodash'

export default function query(node: Node, $params?: {}) {

    let queryFunction = (arg: string) => {

        // return new Query(arg, queryContext, root, setState, getState, $params)
        // console.log('initialNodeState', initialNodeState)
        // return new Query(arg, [nodeState], nodeState)    
        return new Query(arg, [node], node)
    }

    // queryFunction.should = should()
    return queryFunction
}

type Selector = string
type Selection = Node[]

export class Query {

    private _selection: Selection
    private _topNode: Node

    constructor(selector: Selector, context: Selection = [], topNode: Node) {
        this._topNode = topNode
        this._selection = this._find(selector, context)
        // console.log('selection', this._selection)
    }

    // foo() {
    //     console.log('FOO')
    // }

    get should() {
        return should(this)
    }

    size(): number {
        return this._selection.length
    }

    get(): Node[] {
        return this._selection
    }

    pp(): Query {
        if (this._selection.length > 0) {
            const node = this._selection[0]            
            node.pp()          
        }
        return this
    }

    private _find(selector: string, context: Selection): Selection {
        const adapter = createAdapter(this._topNode)
        // console.log('_find')
        return _(context)
            .map(el => {
                return CSSselect(selector, el, { adapter })
            })
            .flatten()
            .uniq()
            .value()
    }

}