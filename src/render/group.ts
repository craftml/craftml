import { DomNode } from '../dom'
import Node from '../node'
import { commit, render, update, refresh } from './effects'
import * as t from 'io-ts'
import createRenderer from './createRenderer'

export interface NodeProps {

}

export interface GroupProps extends NodeProps {
    merge: boolean,
    tagName?: string
}

export function* renderGroup(node: Node, props: GroupProps, domNode: DomNode) {

    if (props.tagName) {
        node = node.setTagName(props.tagName)
    }

    yield commit(node)

    let i = 0

    const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
    const children = domNode.children.filter(isNonEmpty)

    while ( i < children.length) {        

        yield render(node.child(i), children[i])

        node = yield refresh(node)
        
        i = i + 1
        // yield call(render1, node.child(1), domNode.children[1])
    }
}

export default createRenderer({
    tagName: 'group',
    defaultProps: {        
        tagName: '',
        merge: false
    },
    propTypes: t.interface({
        tagName: t.string,
        merge: t.boolean
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () { 
     
        if (props.tagName) {
            node = node.setTagName(props.tagName)
        }
    
        yield commit(node)
    
        let i = 0
    
        const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
        const children = domNode.children.filter(isNonEmpty)
    
        while ( i < children.length) {        
    
            yield render(node.child(i), children[i])
    
            node = yield refresh(node)            
            
            i = i + 1
            
            // yield call(render1, node.child(1), domNode.children[1])
        }
        // }
    
        yield update(node, n => n.setStatus('done'))

    }
})
