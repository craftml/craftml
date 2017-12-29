import { DomNode } from '../dom'
import Node from '../node'
// import * as _ from 'lodash'

import * as iots from 'io-ts'

type PropTypes = iots.InterfaceType<{}, {}>
type RendererDefinition<T extends PropTypes> = {
    tagName: string,
    propTypes: T,
    defaultProps: iots.TypeOf<T>,    
    merge: boolean
    getSaga: (node: Node, props: iots.TypeOf<T>, domNode: DomNode) => ( () => {} )
}

export default function createRenderer<T extends PropTypes>(def: RendererDefinition<T>) {

    return function* (node: Node, props: T, domNode: DomNode): {} {
        
        yield renderNode(def, node, props, domNode)

        return
    }
}

function* renderNode<T extends PropTypes>(
    def: RendererDefinition<T>, 
    node: Node, props: T, domNode: DomNode): {} {

    yield def.getSaga(node, props, domNode)()
    // yield render(node, null)
}