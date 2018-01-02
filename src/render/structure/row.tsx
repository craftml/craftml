import createStructure from './createStructure'
export default createStructure({
  tagName: 'row',
  l: ({spacing = 0}) => `flow x ${spacing} max; align y center z min`
})