import * as  _ from 'lodash'
import { Box } from '../../node'

// const disp = (boxes: Box[]) => _.map(boxes, b => b.toString())

type XYZ = { x: string, y: string, z: string }
type Side = string | { type: string, value: number }

export function align(boxes: Box[], xyz: XYZ): Box[] {
    // console.log('boxes (IN)', disp(boxes), xyz)
    const resultBoxes = _.cloneDeep(boxes)
    _.forEach(xyz, (v, dim) => {
        alignHelper(resultBoxes, dim, v)
    })
    // console.log('boxes (OUT)', disp(result_boxes))
    return resultBoxes
}

export function center(boxes: Box[], xyz: XYZ): Box[] {
    // console.log('boxes (IN)', disp(boxes), xyz)
    if (_.isEmpty(xyz)) {
        // center === center xyz
        xyz = { x: 'center', y: 'center', z: 'center' }
    }

    const resultBoxes = _.cloneDeep(boxes)
    _.forEach(xyz, (v, dim) => {
        alignHelper(resultBoxes, dim, 'center')
    })
    // console.log('boxes (OUT)', disp(result_boxes))
    return resultBoxes
}

function alignHelper(boxes: Box[], dim: string, side: Side = 'min') {

    let v = 0
    if (typeof side === 'string') {
        
        if (side === 'min') {
            v = 0
        } else if (side === 'max') {
            v = 100
        } else if (side === 'center') {
            v = 50
        }

    } else if (side.type === 'percentage') {

        v = side.value

    }    

    let o: Box  // bounds of the first solid
    _.forEach(boxes, (s: Box, i: number) => {

        if (i === 0) {

            o = s

        } else {

            let d = { x: 0, y: 0, z: 0 }
            let percent = v

            // (o + o.s * p) - (r + r.s * p)
            //
            d[dim] = o.position[dim] +
                (o.size[dim] - s.size[dim]) * percent / 100
                - s.position[dim]

            s.position.x += d.x
            s.position.y += d.y
            s.position.z += d.z

        }
    })
}
