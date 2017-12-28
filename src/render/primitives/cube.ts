import createPrimitive from './createPrimitive'
import { BoxGeometry, Matrix4 } from 'three'
import * as t from 'io-ts'

// type CubeProps = {
//     size: string
// }

// const propTypes = {
//   size: PropTypes.string
// }

// function cube(props: CubeProps) {

//   const { size = '10 10 10'} = props
  
//   // TODO: error handling
//   const [ x, y, z ] = size.split(' ').map(Number)

//   const geometry = new BoxGeometry( x, y, z )
//   const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
//   geometry.applyMatrix(matrix)

//   return geometry
// }

export default createPrimitive({
  tagName: 'cube',
  defaultProps: {
    size: '10 10 10'
  },
  propTypes: t.interface({
    size: t.string,    
  }),
  dimensions: 3,
  getGeometry: (props) => {
   
    const { size } = props
    
    // TODO: error handling
    const [ x, y, z ] = size.split(' ').map(Number)
  
    const geometry = new BoxGeometry( x, y, z )
    const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
    geometry.applyMatrix(matrix)
  
    return geometry

  }
})
