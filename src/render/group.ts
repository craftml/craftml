import { DomNode } from '../dom'
import Node from '../node'
import { commit, refresh, render, update } from './effects'

export interface NodeProps {

}

export interface GroupProps extends NodeProps {
    merge: boolean,
    tagName?: string
}

export default function* renderGroup(node: Node, props: GroupProps, domNode: DomNode) {

    if (props.tagName) {
        node = node.setTagName(props.tagName)
    }

    yield commit(node)

    let i = 0

    const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
    const children = domNode.children.filter(isNonEmpty)

    while ( i < children.length) {        

        yield render(node.child(i), children[i])
        
        i = i + 1
        // yield call(render1, node.child(1), domNode.children[1])
    }
    // }

    yield update(node, n => n.setStatus('done'))

    // node = yield refresh(node)
    // // console
    // // n1.pp()

    // node = node.setStatus('done')
    // yield commit(node)
    // yield call(render, node, domNode)
    // return node
}
