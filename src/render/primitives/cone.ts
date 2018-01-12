import createPrimitive from './createPrimitive'
import { CylinderGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export default createPrimitive({
    tagName: 'cone',
    defaultProps: {
        radius: 5
    },
    propTypes: t.interface({
        radius: t.number
    }),
    dimensions: 3,
    getGeometry: (props) => {

        const { radius } = props
        const geometry = new CylinderGeometry(0, radius, 10, 16)
        const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 2)
        const translateMatrix = new Matrix4().makeTranslation(radius, radius, 5)
        const matrix = new Matrix4().multiplyMatrices(translateMatrix, rotationMatrix)
        geometry.applyMatrix(matrix)
        return geometry
        
    }
})
