import createPrimitive from './createPrimitive'
import { BoxGeometry, Matrix4 } from 'three'

type CubeProps = {
    size: string
}

function cube(props: CubeProps) {

  const { size = '10 10 10'} = props
  
  // TODO: error handling
  const [ x, y, z ] = size.split(' ').map(Number)

  const geometry = new BoxGeometry( x, y, z )
  const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
  geometry.applyMatrix(matrix)

  return geometry
}

export default createPrimitive({
  tagName: 'cube',
  defaultProps: {
    size: '10 10 10'
  },
  dimensions: 3,
  getGeometry: cube
})
