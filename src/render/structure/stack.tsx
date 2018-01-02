import createStructure from './createStructure'
export default createStructure({
  tagName: 'stack',
  l: ({spacing = 0}) => `reverse; flow z ${spacing} max; align xy center`
})
