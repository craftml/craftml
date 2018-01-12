import * as _ from 'lodash'
import Node from '../../../node'
import { Geometry, Shape, ExtrudeGeometry, Vector2 } from 'three'

import { isCoplanar } from './utils'

import compute_geometry_from_slices from './createGeometryFromSlices'

export interface NormalizedGeometry extends Geometry {    
    original: Geometry
}

function collect_normalized_geometries(nodes: Node[]): NormalizedGeometry[] {

    return _.compact(_.map(nodes, (node: Node) => {

        const geometry = node.shape.geometry
        if (geometry) {
            const matrix = node.shape.matrix
            // console.log('matrix', matrix.elements)
            const normalizedGeometry = new Geometry() as NormalizedGeometry
            normalizedGeometry.merge(geometry, matrix)
            normalizedGeometry.original = geometry
            return normalizedGeometry
        }

        return undefined

    }))
}

import holes, { Polygon, PolygonGroup } from './holes'

function compute_geometry_from_coplaner_shapes(geometries: Geometry[]) {
    const polygonGroups = holes(geometries)
    // console.log('polygonGroups', polygonGroups)
    
    const polygon2shape = (polygon: Polygon) => 
        new Shape(polygon.src.vertices as {} as Vector2[]) // cooerce Vector3 to Vector2

    const shapes = _.map(polygonGroups, (pg: PolygonGroup) => {
        const s = polygon2shape(pg.shape)
        s.holes = _.map(pg.holes, polygon2shape)
        return s
    })

    // console.log('shapes', shapes)
    const extrudeSettings = {
        steps: 2,
        amount: 1,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 1
    }

    const result = new Geometry()
    _.forEach(shapes, shape => {
        const g = new ExtrudeGeometry(shape, extrudeSettings)
        result.merge(g)
    })
    return result
}

export default function wall(node: Node, args: string = '*', options: {}) {

    node = node.normalizeMatrix()

    const selectedNodes = node.$('craftml-geometry').get()

    // console.log('selectedNodes', selectedNodes)

    const normalizedGeometries = collect_normalized_geometries(selectedNodes)

    let newGeometry: Geometry

    if (normalizedGeometries.length === 1 || isCoplanar(normalizedGeometries)) {

        newGeometry = compute_geometry_from_coplaner_shapes(normalizedGeometries)

    } else {

        newGeometry = compute_geometry_from_slices(normalizedGeometries)

    }
    
    if (newGeometry) {

        const addGeometry = (x: Node) => x.addGeometryNode(newGeometry)
        //
        const deleteUpdaters = _.map(selectedNodes, selectedNode => (x: Node) => x.deleteSubtree(selectedNode))

        const updater = _.flow([...deleteUpdaters, addGeometry])

        return updater(node)

    } else {

        return node
    }

    // return updater(node.addGeometryNode(newGeometry))
}
