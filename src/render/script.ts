import { DomNode } from '../dom'

import { NodeProps } from './index'
import Node from '../node'

// import render from './index'
import { select } from 'redux-saga/effects'
import * as _ from 'lodash'

function localFunctionStatements(locals: {}) {
    
    // expose openjscad functions to main()
    let statements = _.map(_.keys(locals), function(f: string) {
        // 'var cube = $$$.cube'
        var stmt = 'var ' + f + ' = locals.' + f
        return stmt
    }).join(';')

    return statements
}

export default function* renderScript(node: Node, props: NodeProps, domNode: DomNode) {

    // node.props
    // console.log('render script')

    let thisPointer = {
        // make this.children read only
        get children(){
            return []//children
        }
    }

    const root = yield select(state => state)

    root.pp()

    let $ = root.$
    // if (parentNode){
    //     $ = parentNode.$
    // }

    const locals = {
        $,
        // expect: chai.expect,
        // require: custom_require,
        // $params,
        // _: _
     }

    const code = domNode.children[0].data || ''
    
    const stmts = localFunctionStatements(locals)

    const funcBody = `'use strict'; ${stmts}; ${code};`
    
    let f = new Function('locals', funcBody)
    
    // console.log('f', f)

    try {
        // $FlowFixMe
        f.call(thisPointer, locals)
    
        // console.log('$params', $params)
    
        // const newParentNode = parentNode.setContext(Map($params))
    
        // const parentNodux = nodux.parent()
        // if (parentNodux){
        //   yield put(parentNodux.Set(newParentNode.state))
        // }
    
      } catch (err) {
    
        console.error(err)
        // const parentNodux = nodux.parent()
        // console.log('parentNodux', parentNodux)
        // if (parentNodux){
        //   yield put(parentNodux.PushError(err))
        // }
        //  yield put(nodux.PushError(err))
      }

    // const d = DOM(
    //     <craftml-group tagName="craftml-unit" merge={false}>
    //         <craftml-geometry geometry={10}/>
    //     </craftml-group>
    // )

    // yield render(node, d)
}