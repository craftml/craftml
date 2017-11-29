import { React, DomNode, DOM } from '../dom'
import { NodeProps } from './index'
import Node from '../node'

export interface UnitProps extends NodeProps {
    size: number
}

import render from './index'

export default function* renderUnit(node: Node, props: UnitProps, domNode: DomNode): {} {

    const d = DOM(
        <craftml-group tagName="craftml-unit" merge={false}>
            <craftml-geometry geometry={10}/>
        </craftml-group>
    )

    yield render(node, d)
}