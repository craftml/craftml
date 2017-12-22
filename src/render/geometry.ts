import { DomNode } from '../dom'
import Node from '../node'
import { Geometry } from 'three';
import { commit } from './effects'

export interface GeometryProps {
    geometry: Geometry,
    dimensions: number
}

export default function* renderGeometry(node: Node, props: GeometryProps, domNode: DomNode) {
    
    const { geometry, dimensions } = props 

    node = node.setGeometry(geometry).setDimensions(dimensions)
    
    yield commit(node)
}
