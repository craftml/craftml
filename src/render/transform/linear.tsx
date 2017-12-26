import * as _ from 'lodash'
import Node from '../../node'
import { Matrix4 } from 'three'

export function translate(node: Node, args: { x: number, y: number, z: number }) {
    const { x = 0, y = 0, z = 0 } = args    
    const matrix = new Matrix4().makeTranslation(x, y, z)
    return node.applyMatrix(matrix)
}

export function position(node: Node, args: { x: number, y: number, z: number }) {

    const layout = node.layout
    // const { x, y, z } = args
    const d = { x: 0, y: 0, z: 0 }

    _.forEach(args, (v, dim) => {
        d[dim] = v - layout.position[dim]
    })
    const matrix = new Matrix4().makeTranslation(d.x, d.y, d.z)

    return node.applyMatrix(matrix)
}