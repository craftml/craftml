import * as _ from 'lodash'
import Node from '../../node'
import { Matrix4, Vector3 } from 'three'

export function translate(node: Node, args: { x: number, y: number, z: number }) {
    const { x = 0, y = 0, z = 0 } = args
    const matrix = new Matrix4().makeTranslation(x, y, z)
    return node.applyMatrix(matrix)
}

export function position(node: Node, args: { x: number, y: number, z: number }) {

    const layout = node.layout
    const d = { x: 0, y: 0, z: 0 }

    _.forEach(args, (v, dim) => {
        d[dim] = v - layout.position[dim]
    })
    const matrix = new Matrix4().makeTranslation(d.x, d.y, d.z)

    return node.applyMatrix(matrix)
}

export function scale(node: Node, args: { x: number, y: number, z: number }) {
    const layout = node.layout

    const { x = 1, y = 1, z = 1 } = args
    const s = new Vector3(x, y, z)
    const matrix = new Matrix4()
    const m = new Matrix4()

    // position to origin
    matrix.premultiply(m.makeTranslation(-layout.position.x, -layout.position.y, -layout.position.z))
    // scale
    matrix.premultiply(m.makeScale(s.x, s.y, s.z))
    // re-position back
    matrix.premultiply(m.makeTranslation(layout.position.x, layout.position.y, layout.position.z))

    return node.applyMatrix(matrix)
}