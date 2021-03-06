import { render, update } from '../effects'
import { DOM, React, DomNode } from '../../dom'
import * as t from 'io-ts'
import createRenderer from '../createRenderer'
import Node from '../../node'
export { DomNode, Node }

export default createRenderer({
    tagName: 'content',
    defaultProps: {
        name: '',   
        merge: true     
    },
    propTypes: t.interface({
        name: t.string, 
        merge: t.boolean       
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {

        // const block = node.block

        if (node.context.block) {

            let {context, children} = node.context.block

            let topNode = DOM(<craftml-group merge={true}/>)
            let contentNode = DOM(
                <craftml-group merge={true}>
                    {children}
                </craftml-group>
            )

            yield render(node.child(0), topNode)

            // yield update(node.child(0), x => x.setParams(context))

            yield update(node.child(0), x => 
                x.updateContext(ctx => ctx.setParams(context)))

            yield render(node.child(0).child(0), contentNode)

        }

    }
})
