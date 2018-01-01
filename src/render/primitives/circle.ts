import createPrimitive from './createPrimitive'
import { CircleGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'

export default createPrimitive({
    tagName: 'circle',
    defaultProps: {
      radius: 5,
      cx: 0,
      cy: 0,
      resolution: 32
    },
    propTypes: t.interface({
        radius: t.number,
        cx: t.number,
        cy: t.number,
        resolution: t.number
    }),
    dimensions: 2,
    getGeometry: (props) => {
        const { radius, cx, cy, resolution } = props
        const geometry = new CircleGeometry(radius, resolution )

        const matrix = new Matrix4().makeTranslation(cx, cy, 0)
        geometry.applyMatrix(matrix)

        // geometry.vertices.shift() // remove the center

        // make the last vertice to be exactly the same as the first one
        // this allows triangulation to work properly later
        // geometry.vertices[geometry.vertices.length-1].copy(geometry.vertices[0])

        geometry.vertices[0].copy(geometry.vertices[geometry.vertices.length -  1])

        return geometry
    }
  })