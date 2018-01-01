import createPrimitive from './createPrimitive'
import { CylinderGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'

export default createPrimitive({
    tagName: 'prism',
    defaultProps: {
        sides: 3,
        height: 10,
        sideLength: 10
    },
    propTypes: t.interface({
        sides: t.number,
        height: t.number,
        sideLength: t.number
    }),
    dimensions: 3,
    getGeometry: (props) => {

        const { sideLength, height, sides } = props
        const n = sides
        const radius = (sideLength / Math.sin(Math.PI / n)) / 2
        const geometry = new CylinderGeometry(radius, radius, height, n, 1)

        const matrix = new Matrix4()
        const m = new Matrix4()

        matrix.multiply(m.makeTranslation(0, 0, height / 2))
        matrix.multiply(m.makeRotationX(-Math.PI / 2))
        matrix.multiply(m.makeRotationY(Math.PI / n))

        geometry.applyMatrix(matrix)
        return geometry
                
    }
})
