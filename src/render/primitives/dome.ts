import createPrimitive from './createPrimitive'
import { SphereGeometry, CircleGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'
import * as _ from 'lodash'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export interface DomeProps {
    radius: number
}

function getGeometry(props: DomeProps) {

    const { radius } = props
    const geometry = new SphereGeometry(radius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2)

    const rotationMatrix = new Matrix4().makeRotationX(Math.PI / 2)
    geometry.applyMatrix(rotationMatrix)
  
    const circle = new CircleGeometry(radius, 24)
    geometry.merge(circle, new Matrix4().makeRotationX(Math.PI))
  
    const translateMatrix = new Matrix4().makeTranslation(radius, radius, 0)
    geometry.applyMatrix(translateMatrix)
    
    return geometry
}

const getGeometryM = _.memoize(getGeometry, (props: DomeProps) => props.radius)

export default createPrimitive({
    tagName: 'dome',
    defaultProps: {
        radius: 5
    },
    propTypes: t.interface({
        radius: t.number
    }),
    dimensions: 3,
    getGeometry: getGeometryM     
})
