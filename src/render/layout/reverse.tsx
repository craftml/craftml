import * as _ from 'lodash'
export default function reverse<T>(boxes: T[]): T[] {
  _.reverse(boxes)
  return boxes
}