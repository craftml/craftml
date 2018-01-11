import * as _ from 'lodash'
import { Box } from '../../node'

// const disp = (boxes: Box[]) => _.map(boxes, b => b.toString())
    
type Axis = 'x' | 'y' | 'z'
type Arg = {
    axes: Axis[],
    number: number,
    side: string
}

export default function flow(boxes: Box[], args: Arg[]): Box[] {
    // console.log('boxes (IN)', _.map(boxes, b => b.toString()))
    const resultBoxes = _.cloneDeep(boxes)
    _.forEach(args, v => {        
        _.forEach(v.axes, axis => {
            helper(resultBoxes, axis, { spacing: v.number, side: v.side })
        })
    })
    //  console.log('boxes (OUT)', disp(resultBoxes))
    return resultBoxes
}

function helper(boxes: Box[], axis: Axis, args: { spacing: number, side: string }) {

    const { side = 'max', spacing = 0 } = args
    
    if (boxes.length === 0) {
        return
    }

    if (side === 'max') {

        let box0 = boxes[0]
        let d = box0.position[axis] + box0.size[axis] + spacing

        _.forEach(_.tail(boxes), (box) => {
            box.position[axis] = d
            d = d + box.size[axis] + spacing
        })

    } else if (side === 'min') {

        let box0 = boxes[0]
        let d = box0.position[axis]

        _.forEach(_.tail(boxes), (box) => {
            d = d - box.size[axis] - spacing
            box.position[axis] = d
        })
    }
}
