import createRenderer from '../createRenderer'
import * as _ from 'lodash'
import { render, update } from '../effects'
import * as t from 'io-ts'

export default createRenderer({
    tagName: 'craftml-repeat',
    defaultProps: {
        n: 1,
    },
    propTypes: t.interface({
        n: t.number        
    }),
    merge: true,
    getSaga: (node, props, domNode) => function* () {

        // console.log('repeat', domNode)

        // if there is no children, nothing to repeat
        if (domNode.children.length === 0) {
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