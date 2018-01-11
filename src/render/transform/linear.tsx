import * as _ from 'lodash'
import Node from '../../node'
import { Matrix4, Vector3 } from 'three'

type XYZ = {
    x: number,
    y: number,
    z: number
}

function rotateSub(node: Node, dim: string, degrees: number) {

    const layout = node.layout

    const c = {
        x: layout.position.x + layout.size.x / 2,
        y: layout.position.y + layout.size.y / 2,
        z: layout.position.z + layout.size.z / 2
    }

    const m1 = new Matrix4().makeTranslation(-c.x, -c.y, -c.z)
    const m3 = new Matrix4().makeTranslation(c.x, c.y, c.z)

    const matrix = new Matrix4()
    matrix.premultiply(m3)

    // const matrixMethodName = `makeRotation${dim.toUpperCase()}`
    let angle = Math.PI * degrees / 180
    if (dim === 'x') {
        angle = -angle
    }

    let r = new Matrix4()
    if (dim === 'x') {
        r.makeRotationX(angle)
    } else if (dim === 'y') {
        r.makeRotationY(angle)
    } else if (dim === 'z') {
        r.makeRotationZ(angle)
    }

    matrix.multiply(r)

    matrix.multiply(m1)

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function rotate(node: Node, args: XYZ) {

    const updaters = _.map(args, (degrees, dim) => {

        return (n: Node) => rotateSub(n, dim, degrees)

    })

    return _.flow(updaters)(node)
}

export function orbit(node: Node, args: { x: number, y: number, z: number }) {
    // console.log('args', args)

    const orbitSub = (dim: string, degrees: number) => {

        const layout = node.layout
        // const { size, position } = layout

        let c = { x: 0, y: 0, z: 0 }
        c[dim] = -layout.size.x / 2

        // const m1 = new Matrix4().makeTranslation(-c.x, -c.y, -c.z)
        // const m3 = new Matrix4().makeTranslation(c.x, c.y, c.z)

        const m = new Matrix4()
        // matrix.premultiply(m3)

        // const matrixMethodName = `makeRotation${dim.toUpperCase()}`
        let angle = Math.PI * degrees / 180
        if (dim === 'x') {
            angle = -angle
        }
        let r = new Matrix4()
        if (dim === 'x') {
            r.makeRotationX(angle)
        } else if (dim === 'y') {
            r.makeRotationY(angle)
        } else if (dim === 'z') {
            r.makeRotationZ(angle)
        }
        // const r = new THREE.Matrix4()[matrixMethodName](angle)
        m.multiply(r)

        // matrix.multiply(m1)

        return m
    }

    // TODO: update the parser
    // only one axis is allowed
    // orbit x 30
    const arg = args[0]//    
    // first axis, ignore the rest
    const axis = arg.axes[0]
    const matrix = orbitSub(axis, arg.number)

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function translate(node: Node, args: XYZ) {
    const { x = 0, y = 0, z = 0 } = args
    const matrix = new Matrix4().makeTranslation(x, y, z)
    return node.updateShape(s => s.applyMatrix(matrix))
}

export function position(node: Node, args: { x: number, y: number, z: number }) {

    const layout = node.layout
    const d = { x: 0, y: 0, z: 0 }

    _.forEach(args, (v, dim) => {
        d[dim] = v - layout.position[dim]
    })
    const matrix = new Matrix4().makeTranslation(d.x, d.y, d.z)

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function scale(node: Node, args: XYZ) {
    const layout = node.layout

    const { x = 1, y = 1, z = 1 } = args
    const s = new Vector3(x, y, z)
    const matrix = new Matrix4()
    const m = new Matrix4()

    // position to origin
    matrix.premultiply(m.makeTranslation(-layout.position.x, -layout.position.y, -layout.position.z))
    // scale
    matrix.premultiply(m.makeScale(s.x, s.y, s.z))
    // re-position back
    matrix.premultiply(m.makeTranslation(layout.position.x, layout.position.y, layout.position.z))

    return node.updateShape(sp => sp.applyMatrix(matrix))
}

export function land(node: Node) {

    const layout = node.layout

    const { position: { z } } = layout
    const matrix = new Matrix4().makeTranslation(0, 0, -z)

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function center(node: Node, args: XYZ) {

    const layout = node.layout

    //   const currCenter: XYZ = {
    //     x: layout.position.x + layout.size.x / 2,
    //     y: layout.position.y + layout.size.y / 2,
    //     z: layout.position.z + layout.size.z / 2,
    //   }

    //   const {x, y, z} = args // target center position

    let newCenter: XYZ
    if (_.isEmpty(args)) {

        newCenter = {
            x: 0,
            y: 0,
            z: 0
        }

    } else {

        // initially, set to the current center
        newCenter = {
            x: layout.position.x + layout.size.x / 2,
            y: layout.position.y + layout.size.y / 2,
            z: layout.position.z + layout.size.z / 2,
        }

        // for each axis specified, set the new current center
        _.forEach(args, (val, key) => {
            if (_.isNull(val)) {
                newCenter[key] = 0
            } else if (_.isNumber(val)) {
                newCenter[key] = val
            }
        })
    }

    // calcualte the x,y,z offests in order to achieve the new center
    const dx = - layout.position.x + newCenter.x - layout.size.x / 2
    const dy = - layout.position.y + newCenter.y - layout.size.y / 2
    const dz = - layout.position.z + newCenter.z - layout.size.z / 2

    const matrix = new Matrix4().makeTranslation(dx, dy, dz)

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function size(node: Node, args: XYZ) {

    const layout = node.layout

    const { x, y, z } = args // target size
    // if a dimension is zero, ignore it (i.e., scaling factor === 1 )
    const sx = x ? x / layout.size.x : 1
    const sy = y ? y / layout.size.y : 1
    const sz = z ? z / layout.size.z : 1

    const m = new Matrix4()
    const matrix = new Matrix4()
    // position to origin
    matrix.premultiply(m.makeTranslation(-layout.position.x, -layout.position.y, -layout.position.z))
    // scale
    matrix.premultiply(m.makeScale(sx, sy, sz))
    // re-position back
    matrix.premultiply(m.makeTranslation(layout.position.x, layout.position.y, layout.position.z))

    return node.updateShape(s => s.applyMatrix(matrix))
}

export function fit(node: Node, args: XYZ) {
    // fit a shape within a bounding volume, scaled porpotionally
    const layout = node.layout

    const minRatio = _.min(_.map(args, (value, dim) => value / layout.size[dim])) || 1

    const matrix = new Matrix4().makeScale(minRatio, minRatio, minRatio)

    return node.updateShape(s => s.applyMatrix(matrix))
}