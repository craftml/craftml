import createStructure from './createStructure'
import Node from '../../node'
import { DomNode } from '../../dom'
export { Node, DomNode }

export default createStructure({
  tagName: 'stack',
  l: ({spacing = 0}) => `reverse; flow z ${spacing} max; align xy center`
})
