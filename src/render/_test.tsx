import { React, DomNode, DOM } from '../dom'
// import { DomNode } from '../../d'

import { NodeProps } from './index'
import Node from '../node'
import render from './index'

export default function* renderTest(node: Node, props: NodeProps, domNode: DomNode) {
    
    // node.props
    console.log('render test')
    // yield commit(node)

    const d = DOM(
        <craftml-group tagName="craftml-test" merge={false}>
            {domNode.children}
        </craftml-group>
    )

    yield render(node, d)
}
