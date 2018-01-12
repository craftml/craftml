import createPrimitive from './createPrimitive'
import { Shape, Geometry } from 'three'
import * as _ from 'lodash'
import * as t from 'io-ts'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export default createPrimitive({
    tagName: 'polygon',
    defaultProps: {
        points: '',
    },
    propTypes: t.interface({
        points: t.string
    }),
    dimensions: 2,
    getGeometry: (props) => {

        const { points } = props

        const ps = _.map(points.split(' '), tok => {
            return _.map(tok.split(','), Number)
        })

        const shape = new Shape()

        if (ps.length >= 3) {
            const po = ps[0]
            shape.moveTo(po[0], po[1])

            _.forEach(_.tail(ps), p => {
                shape.lineTo(p[0], p[1])
            })
            shape.autoClose = true
            const geometry = shape.createPointsGeometry(1);
            return geometry

        } else {
            // TODO: handle error
            return new Geometry()
        }
    }
})
