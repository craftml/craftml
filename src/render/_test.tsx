import { React, DomNode, DOM } from '../dom'
import Node from '../node'
import render from './index'

export default function* renderTest(node: Node, props: {}, domNode: DomNode): {} {
    
    const d = DOM(
        <craftml-group tagName="craftml-test" merge={false}>
            {domNode.children}
        </craftml-group>
    )

    yield render(node, d)
}
