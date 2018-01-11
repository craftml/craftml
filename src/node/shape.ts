import { Record } from 'immutable'
import { Geometry, Matrix4 } from 'three'

const NodeShapeRecord = Record({    
    dimensions: 0,
    matrix: new Matrix4(),
    geometry: new Geometry()
})

export default class NodeShape extends NodeShapeRecord {    

    setGeometry(geometry: Geometry) {
        return this.set('geometry', geometry)
    }

    setDimensions(dimensions: number = 3) {
        return this.set('dimensions', dimensions)
    }

    setMatrix(matrix: Matrix4) {
        return this.set('matrix', matrix)
    }

    applyMatrix(matrix: Matrix4) {
        const m = new Matrix4().copy(matrix).multiply(this.matrix)
        return this.set('matrix', m)
    }

    translate(x: number, y: number, z: number) {
        const m = new Matrix4().makeTranslation(x, y, z)
        return this.applyMatrix(m)
    }

}