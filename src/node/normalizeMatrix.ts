import Node from '../node'
import { Matrix4 } from 'three'
import * as _ from 'lodash'

export default function normalizeMatrix(node: Node, parentMatrix: Matrix4 = new Matrix4()): Node {

    const children = node.children

    let localMatrix = node.shape.matrix
    let worldMatrix = new Matrix4()

    if (parentMatrix) {
        worldMatrix.multiply(parentMatrix)
    }

    if (localMatrix) {
        worldMatrix.multiply(localMatrix)
    }

    // console.log('worldMatrix', nodeState.get('tagName'), worldMatrix.elements)
    // console.log('localMatrix', localMatrix && localMatrix.elements)

    if (children && children.length > 0) {

        let newNode = node.updateShape(s => s.setMatrix(new Matrix4()))

        const childUpdaters = _.map(children, c => (n: Node) => n.setSubtree(normalizeMatrix(c, worldMatrix)))

        return _.flow(childUpdaters)(newNode)

    } else {

        // console.log('world matrix=>', node.tagName, worldMatrix.elements.join(','))
        return node.updateShape(s => s.setMatrix(worldMatrix))
    }
}
