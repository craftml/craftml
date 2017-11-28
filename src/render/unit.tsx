import { React, DomNode, DOM } from '../dom'
// import { DomNode } from '../../d'

import { NodeProps } from './index'
import Node from '../node'

// function commit(node: Node) {
//     return 0// put({type: 'commit', payload: {node}})
// }

export interface UnitProps extends NodeProps {
    size: number
}

import render from './index'

export default function* renderUnit(node: Node, props: UnitProps, domNode: DomNode) {

    // node.props
    console.log('render unit')

    const d = DOM(
        <craftml-group tagName="craftml-unit" merge={false}>
            <craftml-geometry geometry={10}/>
        </craftml-group>
    )

    yield render(node, d)
}