import createRenderer from '../createRenderer'
import { render, update } from '../effects'
import * as t from 'io-ts'
import { DomNode } from '../../dom'
import Node from '../../node'
export { DomNode, Node }

export default createRenderer({
    tagName: 'craftml-repeat',
    defaultProps: {
        n: 1,
        merge: true
    },
    propTypes: t.interface({
        n: t.number,
        merge: t.boolean  
    }),
    merge: true,
    getSaga: (node, props, domNode) => function* () {

        // console.log('repeat', domNode)

        // if there is no children, nothing to repeat
        if (!domNode.children || domNode.children.length === 0) {
            return
        }
      
        const { n } = props

        // assuming there is only one child
        const onlyChild = domNode.children[0]        
        
        // render the only child
        yield render(node.child(0), onlyChild)
        
        // create other n - 1 copies
        for (let i = 0; i < n - 1; i++) {            
            yield update(node, x => x.copyDescendent(x.child(0), x.child(i + 1)))
        }

    }
})