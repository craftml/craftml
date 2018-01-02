import createStructure from './createStructure'
export default createStructure({
  tagName: 'col',
  l: ({spacing = 0}) => `flow y ${spacing} max; align x center z min`
})
