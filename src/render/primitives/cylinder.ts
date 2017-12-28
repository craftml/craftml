import createPrimitive from './createPrimitive'
import { CylinderGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'

// const Cylinder = t.interface({
//     radius: t.number,
//     height: t.number,
//     resolution: t.number
// })

// type ICylinder = t.TypeOf<typeof Cylinder>

// function cylinder(props: ICylinder) {

//     const { radius, height, resolution } = props
    
//     const geometry = new CylinderGeometry(radius, radius, height, resolution, 1)
//     const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 2)
//     const translateMatrix = new Matrix4().makeTranslation(radius, radius, height / 2)
//     const matrix = new Matrix4().multiplyMatrices(translateMatrix, rotationMatrix)
//     geometry.applyMatrix(matrix)
//     return geometry

// }

export default createPrimitive({
    tagName: 'cylinder',
    defaultProps: {        
        radius: 5,
        height: 10,        
        resolution: 24
    },    
    propTypes: t.interface({
        radius: t.number,
        height: t.number,
        resolution: t.number
    }),
    dimensions: 3,
    getGeometry: (props) => {

        const { radius, height, resolution } = props
        
        const geometry = new CylinderGeometry(radius, radius, height, resolution, 1)
        const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 2)
        const translateMatrix = new Matrix4().makeTranslation(radius, radius, height / 2)
        const matrix = new Matrix4().multiplyMatrices(translateMatrix, rotationMatrix)
        geometry.applyMatrix(matrix)
        return geometry

    }
})
