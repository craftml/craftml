import { DomNode } from '../dom'
import Node from '../node'

// import render from './index'
import { select } from 'redux-saga/effects'
import * as _ from 'lodash'
import { commit, update, parentOf } from './effects'
import createRenderer from './createRenderer'
import * as invariant from 'invariant'
import { Map } from 'immutable'

function localFunctionStatements(locals: {}) {
    
    // expose openjscad functions to main()
    let statements = _.map(_.keys(locals), function(f: string) {
        // 'var cube = $$$.cube'
        var stmt = 'var ' + f + ' = locals.' + f
        return stmt
    }).join(';')

    return statements
}

const getSaga = (node: Node, props: {}, domNode: DomNode) => function*() {

    // node.props
    // console.log('render script')

    const root = yield select(state => state)

    // a script block must have a parent
    let parentNode = yield parentOf(node)
    invariant(parentNode, 'a script node must have a parent node')
    
    let $ = root.$

    let thisPointer = {
        // make this.children read only
        get children() {
            return [] // children
        },

        pp() {
            parentNode.pp()
        }
    }

    let $params = parentNode.context.toJS()

    const locals = {
        $,
        // expect: chai.expect,
        // require: custom_require,
        $params,
        // _: _
        // $root: root
     }

    const code = domNode.children ? domNode.children[0].data : ''
    
    const stmts = localFunctionStatements(locals)

    const funcBody = `'use strict'; ${stmts}; ${code};`
    
    let f = new Function('locals', funcBody)
    
    try {
    
        f.call(thisPointer, locals)
        
        yield update(parentNode, x => x.setContext(Map($params)))    
    
      } catch (err) {
    
        // tslint:disable-next-line:no-console
        // console.error(err.message)  

        node = node.pushError(err) 
        yield commit(node)

      }

    // const d = DOM(
    //     <craftml-group tagName="craftml-unit" merge={false}>
    //         <craftml-geometry geometry={10}/>
    //     </craftml-group>
    // )

    // yield render(node, d)
}

import * as t from 'io-ts'

export default createRenderer({
    tagName: 'script',
    defaultProps: {        
    },
    propTypes: t.interface({        
    }),
    merge: false,
    getSaga: getSaga    
})