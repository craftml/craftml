import { React, DomNode, DOM } from '../dom'
import { NodeProps } from './index'
import Node from '../node'
import * as _ from 'lodash'

import { BoxGeometry, Matrix4 } from 'three'

export interface UnitProps extends NodeProps {
    size: string
}

import render from './index'

// export function* renderUnit(node: Node, props: UnitProps, domNode: DomNode): {} {

//     const { size = '10 10 10' } = props
//     const [ x, y, z ] = _.map(size.split(' '), Number)

//     const geometry = new BoxGeometry(x, y, z)
//     const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
//     geometry.applyMatrix(matrix)

//     // const d = DOM(
//     //     <craftml-group tagName="craftml-unit" merge={false} {...props}>
//     //         <craftml-geometry geometry={geometry} dimensions={3}/>
//     //     </craftml-group>
//     // )

//     const d = DOM(<craftml-geometry geometry={geometry} dimensions={3}/>)
        
//     yield render(node.child(0), d)
// }
import * as iots from 'io-ts'

type PropTypes = iots.InterfaceType<{}, {}>
type RendererDefinition<T extends PropTypes> = {
    tagName: string,
    propTypes: T,
    defaultProps: iots.TypeOf<T>,    
    merge: boolean
    getSaga: (node: Node, props: iots.TypeOf<T>, domNode: DomNode) => ( () => {} )
}

function createRenderer<T extends PropTypes>(def: RendererDefinition<T>) {

    return function* (node: Node, props: T, domNode: DomNode): {} {
        
        yield renderNode(def, node, props, domNode)

        return
    }
}

export default createRenderer({
    tagName: 'craftml-unit',
    defaultProps: {
        size: '10 10 10',
    },
    propTypes: iots.interface({
        size: iots.string        
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* (): {} {
            
        const { size = '10 10 10' } = props
        const [ x, y, z ] = _.map(size.split(' '), Number)
    
        const geometry = new BoxGeometry(x, y, z)
        const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
        geometry.applyMatrix(matrix)
    
        // const d = DOM(
        //     <craftml-group tagName="craftml-unit" merge={false} {...props}>
        //         <craftml-geometry geometry={geometry} dimensions={3}/>
        //     </craftml-group>
        // )
    
        const d = DOM(<craftml-geometry geometry={geometry} dimensions={3}/>)
            
        yield render(node.child(0), d)
        //     yield render(node, domNode)
        // }

    }
})

function* renderNode<T extends PropTypes>(
    def: RendererDefinition<T>, 
    node: Node, props: T, domNode: DomNode): {} {

    yield def.getSaga(node, props, domNode)()
    // yield render(node, null)
}