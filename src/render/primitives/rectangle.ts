import createPrimitive from './createPrimitive'
import { Shape } from 'three'
import * as t from 'io-ts'

export default createPrimitive({
    tagName: 'rectangle',
    defaultProps: {
        width: 10,
        height: 10,
    },
    propTypes: t.interface({
        width: t.number,
        height: t.number
    }),
    dimensions: 2,
    getGeometry: (props) => {
        const { width, height } = props

        const shape = new Shape()
        shape.moveTo(0, 0)
        shape.lineTo(width, 0)
        shape.lineTo(width, height)
        shape.lineTo(0, height)
        shape.lineTo(0, 0)
        shape.autoClose = true
        const geometry = shape.createPointsGeometry(1);
        return geometry
    }
})
