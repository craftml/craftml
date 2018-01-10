import * as _ from 'lodash'
import Node from '../../node'

import { Face3, Vector2, Geometry } from 'three'
// import { Polygon, Vertex } from './utils/ThreeBSP'

// function geometry2Polygons(geometry, matrix) {
//     // console.log('g2p geometry', matrix.elements)
//     let vertices = geometry.vertices
//     let polygons = []
//     for (let i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
//         const face = geometry.faces[i];
//         const faceVertexUvs = geometry.faceVertexUvs[0][i];
//         let polygon = new Polygon()
//         let vertex, uvs, vertext
//         if (face instanceof Face3) {
//             vertex = vertices[face.a];
//             uvs = faceVertexUvs ? new Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
//             vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
//             if (matrix) vertex.applyMatrix4(matrix);
//             polygon.vertices.push(vertex);

//             vertex = vertices[face.b];
//             uvs = faceVertexUvs ? new Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
//             vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
//             if (matrix) vertex.applyMatrix4(matrix);
//             polygon.vertices.push(vertex);

//             vertex = vertices[face.c];
//             uvs = faceVertexUvs ? new Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
//             vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
//             if (matrix) vertex.applyMatrix4(matrix);
//             polygon.vertices.push(vertex);
//         }

//         polygon.calculateProperties()
//         polygons.push(polygon)
//     }
//     return polygons
// }

import ThreeBSP, { createThreeBSP } from './utils/ThreeBSP'


// type BSP = {
//     subtract: (BSP) => BSP,
//     toGeometry: () => Geometry
// }

// function createThreeBSP(geometryNodes: Node[]): BSP {

//     let bspAll = null

//     let allPolygons = []

//     for (let node of geometryNodes) {

//         const { geometry, matrix } = node
//         // const geometry = node.getIn(['shape','geometry'])

//         if (geometry) {

//             // console.log('[createBSP: geometry]', geometry, 'faces', geometry.faces.length);
//             // console.log('matrix', matrix.elements)

//             const polygons = geometry2Polygons(geometry, matrix)
//             const bsp = new ThreeBSP(polygons)

//             if (bspAll) {
//                 bspAll = bspAll.union(bsp)
//             } else {
//                 bspAll = bsp
//             }

//         }
//     }
//     // $FlowFixMe
//     return bspAll

// }

function collectGeometries(node: Node, toCutSelectors: string, fromSelectors: string) {
    
    const geometriesToCut = node.$(toCutSelectors).find('craftml-geometry').get()
    let geometryNodesToCutFrom = node.$(fromSelectors).find('craftml-geometry').get()

    geometryNodesToCutFrom = _.differenceWith(
        geometryNodesToCutFrom, geometriesToCut,
        (a, b) => a.equals(b))

    geometryNodesToCutFrom = _.filter(geometryNodesToCutFrom, g => {

        return _.some(geometriesToCut, f => g.layout.intersectsBox(f.layout))

    })

    const [geometriesToCutViaBSP, geometriesToCutViaDeletion] = _.partition(geometriesToCut, g => {

        return _.some(geometryNodesToCutFrom, f => g.layout.intersectsBox(f.layout))

    })
    // const geometriesToCut = node.$('craftml-geometry')
    // const geometriesToCut = node.$('craftml-geometry')//.find('craftml-geometry').get()

    return {
        from: geometryNodesToCutFrom, 
        toCut: {
            bsp: geometriesToCutViaBSP, 
            delete: geometriesToCutViaDeletion
        }
    }
    // node.pp()
}

export default function cut(node: Node, args: string = '*', options: { selectors?: string } = {}) {

    console.log('cut')

    // node.pp()

    node = node.normalizeMatrix()

    const toCutSelectors = args
    const fromSelectors = options.selectors || '*'

    // console.log('geometriesToCut', _.map(geometriesToCut, 'tagName'))
    // console.log('geometryNodesToCutFrom', _.map(geometryNodesToCutFrom, 'tagName'))
    

    // const geometriesToCut = node.$(toCutSelectors).find('craftml-geometry').get()
    // let geometryNodesToCutFrom = node.$(fromSelectors).find('craftml-geometry').get()

    // geometryNodesToCutFrom = _.differenceWith(
    //     geometryNodesToCutFrom, geometriesToCut,
    //     (a, b) => a.equals(b))

    // geometryNodesToCutFrom = _.filter(geometryNodesToCutFrom, g => {

    //     return _.some(geometriesToCut, f => g.layout.intersectsBox(f.layout))

    // })

    // const [geometriesToCutViaBSP, geometriesToCutViaDeletion] = _.partition(geometriesToCut, g => {

    //     return _.some(geometryNodesToCutFrom, f => g.layout.intersectsBox(f.layout))

    // })
    // const geometriesToCut = node.$('craftml-geometry')
    // const geometriesToCut = node.$('craftml-geometry')//.find('craftml-geometry').get()
    const ret = collectGeometries(node, toCutSelectors, fromSelectors)

    const bsp1 = createThreeBSP(ret.from)
    const bsp2 = createThreeBSP(ret.toCut.bsp)

    // console.log('bsp2', bsp2)
    const resultBsp = bsp1.subtract(bsp2)

    const newGeometry = resultBsp.toGeometry()

    const addGeometry = (n: Node) => n.addGeometryNode(newGeometry)

    const nodesToDelete = [...ret.toCut.bsp, ...ret.toCut.delete, ...ret.from]
    const deleteUpdaters = _.map(nodesToDelete, y => (x: Node) => x.deleteSubtree(y))

    const updater = _.flow([...deleteUpdaters, addGeometry])
    return updater(node)
}

export function cut1(node: Node, args: string = '*', options: { selectors?: string } = {}) {

    node = node.normalizeMatrix()

    const toCutSelectors = args
    const fromSelectors = options.selectors || '*'

    const geometriesToCut = node.$(toCutSelectors).find('craftml-geometry').get()
    let geometryNodesToCutFrom = node.$(fromSelectors).find('craftml-geometry').get()

    // console.log('geometriesToCut', geometriesToCut)

    geometryNodesToCutFrom = _.differenceWith(geometryNodesToCutFrom, geometriesToCut,
        (a, b) => a.state === b.state)

    // //
    // _.forEach(geometryNodesToCutFrom, g => {
    //   _.forEach(geometriesToCut, f => {
    //     console.log('g f', g.layout, f.layout, g.layout.intersectsBox(f.layout))
    //   })
    // })

    geometryNodesToCutFrom = _.filter(geometryNodesToCutFrom, g => {

        return _.some(geometriesToCut, f => g.layout.intersectsBox(f.layout))

    })

    const [geometriesToCutViaBSP, geometriesToCutViaDeletion] = _.partition(geometriesToCut, g => {

        return _.some(geometryNodesToCutFrom, f => g.layout.intersectsBox(f.layout))

    })

    // console.log('geometryNodesToCutFrom', geometryNodesToCutFrom)

    const bsp1 = createThreeBSP(geometryNodesToCutFrom)
    const bsp2 = createThreeBSP(geometriesToCutViaBSP)

    // console.log('bsp2', bsp2)
    const resultBsp = bsp1.subtract(bsp2)


    const newGeometry = resultBsp.toGeometry()


    const addGeometry = node => node.addGeometryNode(newGeometry)
    //
    const deleteUpdaters1 = _.map(geometriesToCut, selectedNode => node => node.deleteSubtree(selectedNode))

    const deleteUpdaters2 = _.map(geometryNodesToCutFrom, selectedNode => node => node.deleteSubtree(selectedNode))
    //
    const updater = _.flow([...deleteUpdaters1, ...deleteUpdaters2, addGeometry])

    return updater(node)
}
