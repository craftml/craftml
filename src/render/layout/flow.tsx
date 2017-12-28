import * as _ from 'lodash'
import { Box } from '../../node'

const disp = (boxes) => _.map(boxes, b =>
    _.values(b.position).join(',') + ' (' + _.values(b.size).join(',') + ')')

type Axis = 'x' | 'y' | 'z'
type Arg = {
  axes: Axis[],
  number: number,
  side: string
}

export default function flow(boxes: Box[], args: Arg[]) : Box[]{
//   console.log('boxes (IN)', disp(boxes))
  const result_boxes = _.cloneDeep(boxes)
  _.forEach(args, v => {
    const {axes, number, side} = v
    _.forEach(axes, axis => {
        helper(result_boxes, axis, {spacing: number, side})
    })
  })
//   console.log('boxes (OUT)', disp(result_boxes))
  return result_boxes
}

function helper(boxes: Box[], axis: Axis, {spacing = 0, side = 'max'}){

  if (boxes.length === 0){
    return
  }



  // let d = null
  if (side === 'max'){

    let box0 = boxes[0]
    let d = box0.position[axis] + box0.size[axis] + spacing

    _.forEach(_.tail(boxes), (box) => {
      box.position[axis] = d
      d = d + box.size[axis] + spacing
    })

  } else if (side === 'min'){

    let box0 = boxes[0]
    let d = box0.position[axis]

    _.forEach(_.tail(boxes), (box) => {
      d = d - box.size[axis] - spacing
      box.position[axis] = d
    })
  }
}
