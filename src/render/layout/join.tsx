import * as _ from 'lodash'
import { Box } from '../../node'

const disp = (boxes: Box[]) => _.map(boxes, b => b.toString())
type Axis = 'x' | 'y' | 'z'
type Arg = {
    axes: Axis[],
    number: number,
    side: string
}

export default function join(boxes: Box[], args: Arg[]): Box[] {
    // console.log('boxes (IN)', disp(boxes))
    const resultBoxes = _.cloneDeep(boxes)
    _.forEach(args, v => {        
        _.forEach(v.axes, axis => {
            helper(resultBoxes, axis, { spacing: v.number, side: v.side })
        })
    })
    // console.log('boxes (OUT)', disp(result_boxes))
    return resultBoxes
}

function helper(boxes: Box[], axis: Axis, options: { spacing: number, side: string }) {

    // const  = args

    const { side = 'max', spacing = 0 } = options
    // console.log('side', side)

    if (boxes.length === 0) {
        return

    } else {

        let first = boxes[0]

        let c = first.center

        if (side === 'max') {

            let d: number = first.position[axis] + first.size[axis] + spacing

            _.forEach(_.tail(boxes), (box: Box) => {
                let ci = box.center
                let delta = { x: c.x - ci.x, y: c.y - ci.y, z: c.z - ci.z }
                delta[axis] = d - box.position[axis]
                box.position.x += delta.x
                box.position.y += delta.y
                box.position.z += delta.z
                d = d + box.size[axis] + spacing
            })

        } else if (side === 'min') {

            let d = first.position[axis]

            _.forEach(_.tail(boxes), (box: Box) => {
                let ci = box.center
                let delta = { x: c.x - ci.x, y: c.y - ci.y, z: c.z - ci.z }
                d = d - box.size[axis] - spacing
                delta[axis] = d - box.position[axis]
                box.position.x += delta.x
                box.position.y += delta.y
                box.position.z += delta.z
            })

        }
    }
}
