import * as THREE from 'three'
import * as _ from 'lodash'
import Node from './Node'
import Polygon from './Polygon'

function geometry2Polygons(geometry: THREE.Geometry | THREE.BufferGeometry, matrix: THREE.Matrix4) {
    // console.log('g2p geometry', matrix.elements)
    // console.log('geometry', geometry.faces.length)
    let vertices

    if (geometry instanceof THREE.Geometry) {

        vertices = geometry.vertices

    } else {

        geometry = new THREE.Geometry().fromBufferGeometry(geometry)
        // get vertices
        vertices = geometry.vertices
        matrix = new THREE.Matrix4();
    }

    let polygons = []
    // tslint:disable-next-line:variable-name
    for (let i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
        const face = geometry.faces[i];
        const faceVertexUvs = geometry.faceVertexUvs[0][i];
        let polygon = new Polygon()
        // let vertex, uvs, vertext
        let vertex, uvs
        if (face instanceof THREE.Face3) {
            vertex = vertices[face.a];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : new THREE.Vector2();
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
            if (matrix) { vertex.applyMatrix4(matrix); }
            polygon.vertices.push(vertex);

            vertex = vertices[face.b];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : new THREE.Vector2();
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
            if (matrix) { vertex.applyMatrix4(matrix); }
            polygon.vertices.push(vertex);

            vertex = vertices[face.c];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : new THREE.Vector2();
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
            if (matrix) { vertex.applyMatrix4(matrix); }
            polygon.vertices.push(vertex);
        }

        polygon.calculateProperties()
        polygons.push(polygon)
    }
    return polygons
}

export function createThreeBSPFromGeometry(geometry: THREE.Geometry, matrix: THREE.Matrix4) {
    const polygons = geometry2Polygons(geometry, matrix)
    return new ThreeBSP(polygons)
    // return bsp
}

import CraftMLNode from '../../../node'

export function createThreeBSP(nodeIterator: CraftMLNode[]): ThreeBSP {

    let bspAll = null

    for (let node of nodeIterator) {

        const geometry = node.shape.geometry
        const matrix = node.shape.matrix

        if (geometry) {

            const polygons = geometry2Polygons(geometry, matrix)

            const bsp = new ThreeBSP(polygons)

            if (bspAll) {
                bspAll = bspAll.union(bsp)
            } else {
                bspAll = bsp
            }

        }
    }

    return bspAll || new ThreeBSP([])
}

import Vertex from './Vertex'
import { Geometry, BufferGeometry } from 'three';

type ThreeBSPGeometry = THREE.Mesh | Polygon[] | Node

export default class ThreeBSP {

    Vertex: Vertex
    Node: Node
    tree: Node
    matrix: THREE.Matrix4

    constructor(input: ThreeBSPGeometry, commonAncestorObject3D?: THREE.Object3D) {

        if (_.isArray(input)) {
            // const polygons = input
            // this.Polygon = Polygon;
            // this.Vertex = Vertex;
            // this.Node = Node;
            this.tree = new Node(input)
            this.matrix = new THREE.Matrix4;
            return
        }

        // Convert THREE.Geometry to ThreeBSP
        // var i, lengthi,
        //     face, vertex, faceVertexUvs, uvs,
        //     polygon,
        // polygons = [],
        // tree;

        // this.Polygon = Polygon;
        // this.Vertex = Vertex;
        // this.Node = Node;
        // if (geometry instanceof THREE.Geometry) {
        //     this.matrix = new THREE.Matrix4;
        // } else if (geometry instanceof THREE.Mesh) {
        //     // #todo: add hierarchy support
        //     geometry.updateMatrix();
        //     this.matrix = geometry.matrix.clone();
        //     geometry = geometry.geometry;
        // } else if (geometry instanceof Node) {
        //     this.tree = geometry;
        //     this.matrix = new THREE.Matrix4;
        //     return this;
        // } else {
        //     throw 'ThreeBSP: Given geometry is unsupported';
        // }
        // let vertices
        if (input instanceof Node) {

            this.tree = input;
            this.matrix = new THREE.Matrix4();
            return this;

        } else {

            // this.matrix = new THREE.Matrix4;

            // geometry.updateMatrix();
            // this.matrix = geometry.matrix.clone();
            // geometry.updateMatrixWorld(true)
            const mesh: THREE.Mesh = input
            // mesh.updateMatrixWorld()
            // console.log('matrix world', geometry.matrixWorld.elements)
            // console.log('matrix local', geometry.matrix.elements)

            let geometry = mesh.geometry;

            if (geometry instanceof Geometry) {
                // vertices = _.map(mesh.geometry.vertices, (v) => commonAncestorObject3D.localToWorld(v.clone()))
                geometry.vertices = _.map(geometry.vertices, (v) => mesh.localToWorld(v.clone()))

            } else if (geometry instanceof BufferGeometry) {

                //     // convert to the normal geometry
                //     geometry = new THREE.Geometry().fromBufferGeometry(geometry)
                //     // get vertices
                //     vertices = geometry.vertices
                //     this.matrix = new THREE.Matrix4();
                // }
                // console.log('world matrix', mesh.matrixWorld.elements)
                // console.log('local matrix', mesh.matrix.elements)

                // this.matrix = mesh.matrixWorld.clone();
                // this.matrix = mesh.matrix.clone();
                this.matrix = new THREE.Matrix4();

                // this.tree = new Node(polygons);

                // console.log('vertices', _.map(vertices, (v) => _.values(v).join(',')))

                // BufferGeometry -> Geometry

                // if the geometry is a buffer geometry,
                // if (input.attributes && input.attributes.position) {
                //     // convert to the normal geometry
                //     input = new THREE.Geometry().fromBufferGeometry(input)
                //     console.log('new geometry', input)
                //     // get vertices
                //     vertices = input.vertices
                //     this.matrix = new THREE.Matrix4();
                //     // vertices = _.map(geometry.vertices, (v) => mesh.localToWorld(v.clone()))
                //     // console.log('converted geometry', geometry)
                // }
            }

            const polygons = geometry2Polygons(geometry, this.matrix)
            this.tree = new Node(polygons);
        }

        // // console.log('geometry.faces', geometry.faces)
        // for (i = 0, lengthi = input.faces.length; i < lengthi; i++) {
        //     face = input.faces[i];
        //     faceVertexUvs = input.faceVertexUvs[0][i];
        //     polygon = new Polygon;

        //     if (face instanceof THREE.Face3) {
        //         vertex = vertices[face.a];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);

        //         vertex = vertices[face.b];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);

        //         vertex = vertices[face.c];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);
        //     } else if (typeof THREE.Face4) {
        //         vertex = input.vertices[face.a];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);

        //         vertex = input.vertices[face.b];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);

        //         vertex = input.vertices[face.c];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);

        //         vertex = input.vertices[face.d];
        //         uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y) : null;
        //         vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[3], uvs);
        //         vertex.applyMatrix4(this.matrix);
        //         polygon.vertices.push(vertex);
        //     } else {
        //         throw 'Invalid face type at index ' + i;
        //     }

        //     polygon.calculateProperties();
        //     polygons.push(polygon);

        // this.tree = new Node(polygons);
        // }
    }

    subtract(otherTree: ThreeBSP): ThreeBSP {
        var a = this.tree.clone(),
            b = otherTree.tree.clone();

        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        let c = new ThreeBSP(a);
        c.matrix = this.matrix;
        return c;
    }

    union(otherTree: ThreeBSP): ThreeBSP {
        var a = this.tree.clone(),
            b = otherTree.tree.clone();

        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        let c = new ThreeBSP(a);
        c.matrix = this.matrix;
        return c;
    }

    invert(): ThreeBSP {
        let a = this.tree.clone();
        a.invert();
        let c = new ThreeBSP(a);
        c.matrix = this.matrix
        return c;
    }

    intersect(otherTree: ThreeBSP): ThreeBSP {
        let a = this.tree.clone(),
            b = otherTree.tree.clone();

        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        let c = new ThreeBSP(a);
        c.matrix = this.matrix;
        return c;
    }

    toGeometry(): Geometry {
        var i, j,
            matrix = new THREE.Matrix4().getInverse(this.matrix),
            geometry = new THREE.Geometry(),
            polygons = this.tree.allPolygons(),
            polygonCount = polygons.length,
            polygon: Polygon,
            polygonVerticeCount,
            verticeDict = {},
            vertexIdxA, vertexIdxB, vertexIdxC,
            vertex, face,
            verticeUvs;

        for (i = 0; i < polygonCount; i++) {
            polygon = polygons[i];
            polygonVerticeCount = polygon.vertices.length;

            for (j = 2; j < polygonVerticeCount; j++) {
                verticeUvs = [];

                vertex = polygon.vertices[0];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);

                if (typeof verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {
                    vertexIdxA = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxA = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j - 1];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {
                    vertexIdxB = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxB = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {
                    vertexIdxC = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {
                    geometry.vertices.push(vertex);
                    vertexIdxC = verticeDict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                if (polygon.normal) {

                    face = new THREE.Face3(
                        vertexIdxA,
                        vertexIdxB,
                        vertexIdxC,
                        new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z)
                    );

                    geometry.faces.push(face);
                    geometry.faceVertexUvs[0].push(verticeUvs);
                }

            }

        }
        return geometry;
    }

    toMesh(material: THREE.Material) {
        var geometry = this.toGeometry(),
            mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(this.matrix);
        mesh.rotation.setFromRotationMatrix(this.matrix);

        return mesh;
    };
}