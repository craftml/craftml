import { React, DOM } from '../../dom'
import { render, update } from '../effects'
import transformEval from './eval'

import * as t from 'io-ts'
import createRenderer from '../createRenderer'

export default createRenderer({
    tagName: 'craftml-transform',
    defaultProps: {
        t: ''        
    },
    propTypes: t.interface({
        t: t.string
    }),
    merge: true,
    getSaga: (node, props, domNode) => function* () {
            
        // const { t = '' } = props

        const d = DOM(
        <craftml-group merge={true} tagName="craftml-transform" {...props}>
            {domNode.children}
        </craftml-group>)
        
        yield render(node, d)
    
        yield update(node, n => transformEval(n, props.t))

    }
})