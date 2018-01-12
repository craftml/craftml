import createStructure from './createStructure'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export default createStructure({
  tagName: 'col',
  l: ({spacing = 0}) => `flow y ${spacing} max; align x center z min`
})
