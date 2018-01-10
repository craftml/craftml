import * as _ from 'lodash'
import Node from '../../node'
import { Vector3 } from 'three'
import { Face3, Geometry } from 'three'

export default function hull(node: Node, args: string = '*', options: {}) {

    node = node.normalizeMatrix()

    const selectors = args || '*'

    const q = node.$(selectors).find('craftml-geometry')

    const selections = q.get()

    const allVertices = q.vertices()

    
    const newGeometry = compute_convex_hull(allVertices)



    const addGeometry = (x: Node) => x.addGeometryNode(newGeometry)
    
    const deleteUpdaters = _.map(selections, selectedNode => (x: Node) => x.deleteSubtree(selectedNode))
    
    const updater = _.flow([...deleteUpdaters, addGeometry])

    return updater(node)
}

type qhInput = [number, number, number][]
type qhOuput = number[]

const qh: (x: qhInput) => qhOuput = require('convex-hull')

function compute_convex_hull(vertices: Vector3[]) {
    // console.log('vertices', vertices.length)
    const input = _.map(vertices, v => [v.x, v.y, v.z])
    // console.log('input', input)
    const DEBUG = `hull ${vertices.length} vertices`
    console.time(DEBUG)
    let is = qh(input)
    console.timeEnd(DEBUG)
    let faces = []
    for (var i = 0; i < is.length; i++) {
        faces.push(new Face3(is[i][0], is[i][1], is[i][2]))
    }
    let geometry = new Geometry()
    geometry.vertices = vertices
    geometry.faces = faces
    geometry.computeFaceNormals()
    return geometry
}
