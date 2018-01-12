import createStructure from './createStructure'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export default createStructure({
  tagName: 'row',
  l: ({spacing = 0}) => `flow x ${spacing} max; align y center z min`
})