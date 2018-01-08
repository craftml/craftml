import createRenderer from '../createRenderer'
import * as _ from 'lodash'
import { render, update } from '../effects'
import * as t from 'io-ts'
import { DOM, React } from '../../dom'

export default createRenderer({
    tagName: 'craftml-foreach',
    defaultProps: {
        iterator: '',
        iterable: '',
    },
    propTypes: t.interface({
        iterator: t.string,
        iterable: t.string
    }),
    merge: true,
    getSaga: (node, props, domNode) => function* () {

        // console.log('repeat', domNode)

        // if there is no children, nothing to repeat
        if (domNode.children.length === 0) {
            return
        }
      
        const { iterator: iteratorName, iterable: iterableName } = props

        const context = node.context        

        const eachTop = DOM(<craftml-group merge={true}/>)
        const eachContent = DOM(
            <craftml-group merge={true}>
                {domNode.children}
            </craftml-group>
        )
                        
        const iterable = context.get(iterableName)
        
        if (_.isArray(iterable)) {

            const n = iterable.length
        
            // create other n - 1 copies
            for (let i = 0; i < n; i++) {            
             
                yield render(node.child(i), eachTop)
             
                const value = iterable[i]
                const eachContext = context.set(iteratorName, value)
                yield update(node.child(i), c => c.setContext(eachContext))

                yield render(node.child(i).child(0), eachContent)

            }

        }
    }
})