import { DomNode } from '../dom'
import Node from '../node'

export interface NodeProps {

}

import renderUnit from './unit'
import renderTest from './_test'
import renderScript from './script'
import renderGeometry from './geometry'
import renderGroup from './group'

import { commit } from './effects'
    
export default function* renderNode(node: Node, domNode: DomNode): {} {

    const tagName = domNode.name
    
    node = node.setTagName(tagName)
    
    yield commit(node)

    const props = domNode.attribs

    if (tagName === 'craftml-unit') {

        yield renderUnit(node, props, domNode)
    
    } else if (tagName === 'craftml-group') {

        yield renderGroup(node, props, domNode)

    } else if (tagName === 'craftml-geometry') {
        
        yield renderGeometry(node, props, domNode)

    } else if (tagName === 'test') {
        
        yield renderTest(node, props, domNode)

    } else if (tagName === 'script') {

        yield renderScript(node, props, domNode)
    }     

    // yield put({type: 'hello'})
    // return node
}