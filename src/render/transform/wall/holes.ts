import * as _ from 'lodash'
import { Geometry, Vector3 } from 'three'
const polygonsIntersect = require('polygons-intersect')

export type PolygonGroup = {
  shape: Polygon,
  holes: Polygon[]
}

export type PolygonNode = {
  inside?: boolean,
  poly: Polygon,
  children: PolygonNode[]
}

export type Polygon = {
  src: Geometry,
  vertices: Vector3[]
}

function contains(poly1: Polygon, poly2: Polygon) {
  const vs1 = poly1.vertices
  const vs2 = poly2.vertices
  const intersects = polygonsIntersect(vs1, vs2)
  const n = intersects.length
  // TODO: test further
  return n === vs1.length || n === vs2.length
}

function insert(o: PolygonNode , poly: Polygon) {

  let oc = _.find(o.children, c => {
      return contains(c.poly, poly)
  })

  if (oc) {

      insert(oc, poly)

  } else {

      let [children, peers] = _.partition(o.children, c => {
          return contains(poly, c.poly)
      })

      let p = {poly, children}
      o.children = peers.concat(p)
  }
}

function collectPolygonGroups(o: PolygonNode, accum: PolygonGroup[], inside: boolean = false) {
    o.inside = inside
    if (inside) {

      const group: PolygonGroup  = {
        shape: o.poly,
        holes: _.compact(_.map(o.children, c => c.poly))
      }

      accum.push(group)

    }
    _.forEach(o.children, c => collectPolygonGroups(c, accum, !inside))
}

export default function holes(geometries: Geometry[]): PolygonGroup[] {

  const polygons: Polygon[] = _.map(geometries, geometry => {
    return {
      src: geometry,
      vertices: geometry.vertices
    }})

  // force it to be a PolygonNode, even though it doesn't have 'poly'
  let o: PolygonNode = {
    children: []    
  } as {} as PolygonNode

  _.forEach(polygons, polygon => {
    insert(o, polygon)
  })

  let polygonGroups: PolygonGroup[] = []
  collectPolygonGroups(o, polygonGroups)
  // console.log('polygonGroups', polygonGroups)
  return polygonGroups
}
