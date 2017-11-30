import { Matrix4, Geometry, BufferGeometry, Box3, Vector3, InterleavedBufferAttribute } from 'three'
// import { Map } from 'immutable'
// import type { NodeState } from '../nodux'
import * as _ from 'lodash'
import Node from './index'

function createBox3FromGeometry(geometry: Geometry, matrix: Matrix4 = new Matrix4()) {

    let box = new Box3()
    let v1 = new Vector3()

    if (geometry instanceof Geometry) {

        var vertices = geometry.vertices;
        // console.log('vertices', vertices)

        for (var i = 0, il = vertices.length; i < il; i++) {

            v1.copy(vertices[i]);

            v1.applyMatrix4(matrix);

            box.expandByPoint(v1);

        }

    } else if (geometry instanceof BufferGeometry) {

        var attribute = geometry.attributes.position;

        if (attribute !== undefined) {

            var array, offset, stride;

            if (attribute instanceof InterleavedBufferAttribute) {

                array = attribute.data.array;
                offset = attribute.offset;
                stride = attribute.data.stride;

            } else {

                array = attribute.array;
                offset = 0;
                stride = 3;

            }

            for (var i = offset, il = array.length; i < il; i += stride) {

                v1.fromArray(array, i);

                v1.applyMatrix4(matrix);

                box.expandByPoint(v1);

            }

        }

    }

    return box
}

// node: an immutable node or a computed DOM node
function computeBoundingBox(node: Node, parentMatrix: Matrix4 = new Matrix4()): Box3 {

    const children = node.children

    const matrix = new Matrix4()
    matrix.copy(parentMatrix)

    const currentMatrix = node.matrix
    if (currentMatrix) {
        matrix.multiply(currentMatrix)
    }

    const geometry = node.geometry

    let selfBox
    if (geometry) {
        selfBox = createBox3FromGeometry(geometry, matrix)
    } else {
        selfBox = new Box3()
    }

    if (children.length > 0) {

        return _.reduce(children, (box, child) => {

            const childBox = computeBoundingBox(child, matrix)
            if (!childBox.isEmpty()) {
                return box.union(childBox)
            } else {
                return box
            }
        },              selfBox)

    } else {

        return selfBox

    }
}

type V3 = { x: number, y: number, z: number }

export class Box {

    position: V3    
    size: V3
    index: number

    constructor() {
        // this.position = new Vector3(0,0,0)
        // this.size = new Vector3(0,0,0)
    }
    
    getCenter(): V3 {
        return {
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2,
            z: this.position.z + this.size.z / 2
        }
    }

    get max(): V3 {
        return {
            x: this.position.x + this.size.x,
            y: this.position.y + this.size.y,
            z: this.position.z + this.size.z
        }
    }

    intersectsBox(box: Box) {
        const max1 = this.max
        const max2 = box.max
        const min1 = this.position
        const min2 = box.position
        // using 6 splitting planes to rule out intersections.
        return max2.x < min1.x || min2.x > max1.x ||
            max2.y < min1.y || min2.y > max1.y ||
            max2.z < min1.z || min2.z > max1.z ? false : true;
    }

}

export function createBox(node: Node, parentMatrix: Matrix4 = new Matrix4()): Box {

    if (node) {
        const box3 = computeBoundingBox(node, parentMatrix)
        const layout = new Box()
        layout.position = box3.min
        layout.size = new Vector3(
            Math.max(box3.max.x - box3.min.x, 0),
            Math.max(box3.max.y - box3.min.y, 0),
            Math.max(box3.max.z - box3.min.z, 0))
        return layout
    } else {
        return new Box()
    }
}
