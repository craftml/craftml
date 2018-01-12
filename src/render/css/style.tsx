import { parentOf, update } from '../effects'
import * as t from 'io-ts'
import createRenderer from '../createRenderer'
import * as css from './index'
import { DomNode } from '../../dom'
import Node from '../../node'
export { DomNode, Node }

export default createRenderer({
    tagName: 'craftml-style',
    defaultProps: {        
    },
    propTypes: t.interface({        
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {

        const parent = yield parentOf(node)

        if (domNode.children && domNode.children[0] && domNode.children[0].data) {
        
            const cssText: string = domNode.children[0].data || ''                

            const { stylesheet } = css.parse(cssText)

            yield update(parent, x => 
                x.updateContext(c => c.addStyleSheet(stylesheet)))

        }

    }
})