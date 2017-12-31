// import { DomNode } from '../dom'
// import Node from '../node'
import { Geometry } from 'three';
import { commit } from './effects'

// export interface GeometryProps {
//     geometry: Geometry,
//     dimensions: number
// }

// export function* renderGeometry(node: Node, props: GeometryProps, domNode: DomNode) {
    
//     const { geometry, dimensions } = props 

//     node = node.setGeometry(geometry).setDimensions(dimensions)
    
//     yield commit(node)
// }

// import { React, DOM } from '../dom'
// import * as _ from 'lodash'
// import { BoxGeometry, Matrix4 } from 'three'
// import { render } from './effects'
import * as t from 'io-ts'
import createRenderer from './createRenderer'

export default createRenderer({
    tagName: 'craftml-geometry',
    defaultProps: {
        geometry: {},
        dimensions: 3
    },
    propTypes: t.interface({
        geometry: t.object,   
        dimensions: t.number  
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        const { geometry, dimensions } = props 

        node = node.setGeometry(geometry as Geometry).setDimensions(dimensions)
    
        yield commit(node)

    }
})