import * as _ from 'lodash'
import * as THREE from 'three'
import { Geometry, Vector3, ShapeUtils, Face3 } from 'three'
// import earcut from 'earcut'
// const { ShapeUtils, Vector3, Matrix4, Math: _Math } = THREE
import { NormalizedGeometry } from './index'

interface Point {
    x: number,
    y: number
}

const isClockWise = ShapeUtils.isClockWise as {} as (pts: Point[]) => boolean

type Triangulation = [number, number, number]
const triangulateShape = ShapeUtils.triangulateShape as {} as (contour: Point[], holes: Point[][]) => Triangulation[]

class Contour {

    offset: number
    n: number
    vertices: Vector3[]
    original: {
        vertices: Vector3[]
    }

    constructor(offset: number, geometry: NormalizedGeometry) {
        this.offset = offset
        this.n = geometry.vertices.length
        this.vertices = geometry.vertices
        this.original = {
            vertices: geometry.original.vertices
        }
    }

    vid(i: number) {
        return this.offset + i
    }
}

const signedDistanceToPolygon = (pt: Vector3, polygon: NormalizedGeometry) => {

    const faces = triangulateShape(polygon.original.vertices, [])
    const ovs = polygon.original.vertices
    const goodFace = _.find(faces, face => {
        const [ai, bi, ci] = face
        const a = ovs[ai]
        const b = ovs[bi]
        const c = ovs[ci]
        const triangle = new THREE.Triangle(a, b, c)
        const area = triangle.area()
        // console.log('area', area)
        return area > 0.01
    })

    if (goodFace) {
        const [aj, bj, cj] = goodFace
        const a = polygon.vertices[aj]
        const b = polygon.vertices[bj]
        const c = polygon.vertices[cj]
        const triangle = new THREE.Triangle(a, b, c)
        const plane = triangle.plane()
        return plane.normal.dot(pt) + plane.constant

    } else {
        // TODO: what's the problem with this?
        return 0
    }
}

const computeSignedDistanceBetweenPolygons = (g1: NormalizedGeometry, g2: NormalizedGeometry) => {
    if (g1.vertices.length === 1 && g2.vertices.length > 1) {
        // g1: point -> g2: polygon
        const pt = g1.vertices[0]
        return -signedDistanceToPolygon(pt, g2)
        // console.log('d1', d)

    } else if (g1.vertices.length > 1) {
        // g1: polygon -> g2: polygon | point
        const pt = g2.vertices[0]
        return signedDistanceToPolygon(pt, g1)
    } else {
        return 0
    }
}

const computeDirectionBetweenPolygons = (g1: NormalizedGeometry, g2: NormalizedGeometry) =>
    computeSignedDistanceBetweenPolygons(g1, g2) > 0

const computeDistanceBetweenPolygons = (g1: NormalizedGeometry, g2: NormalizedGeometry) =>
    g1.vertices[0].distanceTo(g2.vertices[0])

function checkDirection(geometries: NormalizedGeometry[]) {
    const [g1, g2, ...rest] = geometries
    return computeSignedDistanceBetweenPolygons(g1, g2)
}

function checkTorus(geometries: NormalizedGeometry[]) {
    if (_.some(geometries, geometry => geometry.vertices.length < 3)) {
        return false
    }

    if (geometries.length < 2) {
        return false
    }

    const first = _.first(geometries)
    const second = geometries[1]
    const last = _.last(geometries)

    if (first && last) {

        const directionFirstLast = computeDirectionBetweenPolygons(first, last)
        const directionFirstSecond = computeDirectionBetweenPolygons(first, second)

        const distanceFirstLast = computeDistanceBetweenPolygons(first, last)
        const distanceFirstSecond = computeDistanceBetweenPolygons(first, second)

        let similar = Math.abs(distanceFirstLast - distanceFirstSecond) < 1
        // console.log('dir', directionFirstLast, directionFirstSecond)
        return (directionFirstLast !== directionFirstSecond)
            && similar

    } else {

        return false

    }
}

export default function createGeometryFromSlices(geometries: NormalizedGeometry[]) {

    let vertices: Vector3[] = [], faces: Face3[] = []

    const direction = checkDirection(geometries)
    const bFlipped = direction < 0
    const isTorus = checkTorus(geometries)

    // console.log('direction', direction, 'flipped', bFlipped, 'isTorus', isTorus)

    // const clockwise = THREE.ShapeUtils.isClockWise(geom.original.vertices)

    _.forEach(geometries, geom => {
        const [a, b, c, ...others] = geom.vertices
        const triangle = new THREE.Triangle(a, b, c)

        // if (clockwise){
        // vertices = vertices.concat(_.map(geom.vertices).reverse())
        // } else {
        vertices = vertices.concat(geom.vertices)
        // }
    })

    const slicesPathVertices = _.map(geometries, geom => {
        return geom.vertices[0]
    })
    const isPathClockwise = isClockWise(slicesPathVertices)
    // console.log('isPathClockwise', isPathClockwise)

    const contours: Contour[] = []
    let offset = 0
    _.forEach(geometries, g => {
        const contour = new Contour(offset, g)
        contours.push(contour)
        offset += g.vertices.length
    })

    const f4 = (a: number, b: number, c: number, d: number) => {
        faces.push(new Face3(a, b, d, undefined, undefined, 1));
        faces.push(new Face3(b, c, d, undefined, undefined, 1));
    }

    const f3 = (a: number, b: number, c: number) => {
        faces.push(new THREE.Face3(a, b, c, undefined, undefined, 0));
    }

    function buildLidFaces(contour: Contour, flipped: boolean = false) {
        // const firstShape = new THREE.Shape(contour.vertices)
        // use the original geometry's vertices (2D) to triangulate
        const lidFaces = triangulateShape(contour.original.vertices, [])
        // console.log('lid faces', lidFaces.length)
        for (let i = 0; i < lidFaces.length; ++i) {
            let [a, b, c] = lidFaces[i]
            if (flipped) {
                f3(contour.vid(a), contour.vid(c), contour.vid(b))
            } else {
                f3(contour.vid(a), contour.vid(b), contour.vid(c))
            }
        }
    }

    function buildWallBetweenContours(contour1: Contour, contour2: Contour, flipped: boolean) {

        const sl = contour1.n
        for (let i = 0; i < sl - 1; i++) {
            const v1 = contour1.vid(i)
            const v2 = contour2.vid(i)
            let a = v1 + 1,
                b = v1,
                c = v2,
                d = v2 + 1
            if (flipped) {
                f4(a, b, c, d)
            } else {
                f4(b, a, d, c)
            }
        }

        const e1 = contour1.n - 1
        const e2 = contour2.n - 1
        // last one
        if (flipped) {
            f4(0, e1, e2, 0)
        } else {
            f4(e1, 0, 0, e2)
        }
    }

    function buildWallBetweenContourAndPoint(contour: Contour, contourPoint: Contour, flipped: boolean) {

        const sl = contour.n
        for (let i = 0; i < sl - 1; i++) {
            const v = contour.vid(i)
            const p = contourPoint.vid(0)
            let a = v, b = v + 1
            if (flipped) {
                f3(b, a, p)
            } else {
                f3(a, b, p)
            }
        }

    }

    let firstContour = _.first(contours)
    let lastContour = _.last(contours)

    // in-between

    const polyContours = _.filter(contours, contour => contour.n >= 3)
    let clockwise = isClockWise(polyContours[0].original.vertices)

    for (let i = 0; i < polyContours.length - 1; ++i) {
        const contour1 = polyContours[i]
        const contour2 = polyContours[i + 1]
        buildWallBetweenContours(contour1, contour2, clockwise ? !bFlipped : bFlipped)
    }

    if (isTorus) {

        lastContour = _.last(polyContours)
        firstContour = _.first(polyContours)
        if (lastContour && firstContour) {
            buildWallBetweenContours(lastContour, firstContour, clockwise ? !bFlipped : bFlipped)
        }

    } else {

        // start-point

        if (firstContour) {

            if (firstContour.n === 1) {
                const nextContour = contours[1]
                clockwise = isClockWise(nextContour.original.vertices)
                buildWallBetweenContourAndPoint(nextContour, firstContour, clockwise ? bFlipped : !bFlipped)
            } else {
                buildLidFaces(firstContour, !bFlipped)
            }

        }

        // end-point

        if (lastContour) {

            if (contours.length >= 2 && lastContour && lastContour.n === 1) {
                const prevContour = contours[contours.length - 2]
                clockwise = isClockWise(prevContour.original.vertices)
                buildWallBetweenContourAndPoint(prevContour, lastContour, clockwise ? !bFlipped : bFlipped)
            } else {
                buildLidFaces(lastContour, bFlipped)
            }

        }

    }

    const result = new THREE.Geometry()

    result.vertices = vertices
    result.faces = faces

    result.verticesNeedUpdate = true
    result.elementsNeedUpdate = true

    result.computeFaceNormals()

    return result
}
