import { React, DomNode, DOM } from '../../dom'
import { render, refresh, update } from '../effects'
import Node from '../../node'
import transformEval from './eval'

export interface TransformProps {
    t: string
}

export default function* renderTransform(node: Node, props: TransformProps, domNode: DomNode) {

    const { t = '' } = props

    const d = DOM(
    <craftml-group merge={true} tagName="craftml-transform">
        {domNode.children}
    </craftml-group>)
    
    yield render(node, d)

    node = yield refresh(node)

    yield update(node, n => transformEval(n, t))

}