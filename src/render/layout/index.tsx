import { React, DomNode, DOM } from '../../dom'
import { render, update } from '../effects'
import Node from '../../node'
import layoutEval from './eval'
import createRenderer from '../createRenderer'
import * as t from 'io-ts'

// export interface LayoutProps {
//     l: string
// }

// export default function* renderLayout(node: Node, props: LayoutProps, domNode: DomNode) {

//     const { l = '' } = props

//     const d = DOM(
//     <craftml-group merge={true} tagName="craftml-layout" {...props}>
//         {domNode.children}
//     </craftml-group>)
    
//     yield render(node, d)
    
//     yield update(node, n => layoutEval(n, l))
// }



export default createRenderer({
    tagName: 'craftml-layout',
    defaultProps: {
        l: ''        
    },
    propTypes: t.interface({
        l: t.string
    }),
    merge: true,
    getSaga: (node, props, domNode) => function* () {
            
        const { l = '' } = props

        const d = DOM(
        <craftml-group merge={true} tagName="craftml-layout" {...props}>
            {domNode.children}
        </craftml-group>)
        
        yield render(node, d)
        
        yield update(node, n => layoutEval(n, l))
    }
})