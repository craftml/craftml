import Node from './index'
import { Vector3 } from 'three'

export function getVertices(node: Node): Vector3[] {
    const geometry = node.geometry
    const matrix = node.matrix

    let result = []
    if (geometry && geometry.vertices) {
        // console.log('matrix=>', matrix.elements.join(','))
        let vertices = geometry.vertices
        for (var i = 0, il = vertices.length; i < il; i++) {
            let v = vertices[i].clone()
            v.applyMatrix4(matrix)
            result.push(v)
        }
    }

    return result
}
