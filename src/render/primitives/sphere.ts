import createPrimitive from './createPrimitive'
import { SphereGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'

export default createPrimitive({
    tagName: 'sphere',
    defaultProps: {        
        radius: 5,     
        resolution: 16
    },    
    propTypes: t.interface({
        radius: t.number,        
        resolution: t.number
    }),
    dimensions: 3,
    getGeometry: (props) => {

        const { radius, resolution } = props
        const geometry = new SphereGeometry(radius, resolution, resolution)
        const matrix = new Matrix4().makeTranslation(radius, radius, radius)
        geometry.applyMatrix(matrix)
        return geometry
    }
})
