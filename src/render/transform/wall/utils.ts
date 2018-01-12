import { Geometry, Triangle } from 'three'

// calculate if the given geometries are coplanar
// TODO: currently only pick the first two geometries to examine
export function isCoplanar(geometries: Geometry[]) {

  const computeFirstTriangle = (geometry: Geometry) => {
    // console.log('geometry', geometry)
    if (geometry.faces.length > 0) {
      const { a: ai, b: bi, c: ci } = geometry.faces[0]
      const a = geometry.vertices[ai]
      const b = geometry.vertices[bi]
      const c = geometry.vertices[ci]
      return new Triangle(a, b, c)
    } else {
      const a = geometry.vertices[0]
      const b = geometry.vertices[1]
      const c = geometry.vertices[2]
      return new Triangle(a, b, c)
    }
  }

  const t1 = computeFirstTriangle(geometries[0])
  const t2 = computeFirstTriangle(geometries[1])

  // console.log('t1',t1.plane(),'t2',t2.plane())
  const p1 = t1.plane()
  const p2 = t2.plane()

  const distanceBetweenNormals = p1.normal.distanceTo(p2.normal)
  const distanceBetweenConstants = Math.abs(p1.constant - p2.constant)
  // console.log('difference', distanceBetweenNormals, distanceBetweenConstants)
  const closeTo = (a: number, b: number) => Math.abs(a - b) < 0.00001
  const areNormalsCoLinear = closeTo(distanceBetweenNormals, 2) || closeTo(distanceBetweenNormals, 0)
  const areConstantsVerySimilar = distanceBetweenConstants < 0.00001
  return areNormalsCoLinear && areConstantsVerySimilar
}
