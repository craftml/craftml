import { React, DOM, DomNode } from '../../dom'
import { render, update } from '../effects'
import layoutEval from './eval'
import createRenderer from '../createRenderer'
import * as t from 'io-ts'
import Node from '../../node'
export { Node, DomNode }

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