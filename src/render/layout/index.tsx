import { React, DomNode, DOM } from '../../dom'
import { render, refresh, update } from '../effects'
import Node from '../../node'
import layoutEval from './eval'

export interface LayoutProps {
    l: string
}

export default function* renderLayout(node: Node, props: LayoutProps, domNode: DomNode) {

    const { l = '' } = props

    const d = DOM(
    <craftml-group merge={true} tagName="craftml-layout" {...props}>
        {domNode.children}
    </craftml-group>)
    
    yield render(node, d)
    
    yield update(node, n => layoutEval(n, l))
}