import Node from './index'
import { Geometry, Vector3, Matrix4 } from 'three'

import * as fs from 'fs'

export function saveAs(node: Node, filename: string) {
    const str = toSTLString(node)
    fs.writeFileSync(filename, str, 'utf8')
}

export function toSTLString(node: Node) {
    node = node.normalizeMatrix()
    let ret = toSTLHelper(node)
    ret = `solid exported\n ${ret} \nendsolid exported\n`    
    return ret    
}

export function toSTLHelper(node: Node) {

    const children = node.children
    
    let str = ''
    if (node.shape.geometry) {
        str += geometryToSTLString(node.shape.geometry, node.shape.matrix)
    }

    if (children && children.length > 0) {
        str += children.map(toSTLHelper).join('\n')
    }

    return str
}

const vector = new Vector3();

function geometryToSTLString(geometry: Geometry, matrix: Matrix4) {
    let output = ''
    let vertices = geometry.vertices;
    let faces = geometry.faces;

    // normalMatrixWorld.getNormalMatrix(matrixWorld);

    for (let i = 0, l = faces.length; i < l; i++) {
        let face = faces[i];

        vector.copy(face.normal).applyMatrix4(matrix).normalize();
        // vector.copy(face.normal).normalize();

        output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
        output += '\t\touter loop\n';

        let indices = [face.a, face.b, face.c];

        for (let j = 0; j < 3; j++) {
            var vertexIndex = indices[j];
            if (geometry.skinIndices.length === 0) {

                vector.copy(vertices[vertexIndex]).applyMatrix4(matrix);
                output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

            } else {

                vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

                // see https://github.com/mrdoob/three.js/issues/3187
                let boneIndices = [];
                boneIndices[0] = mesh.geometry.skinIndices[vertexIndex].x;
                boneIndices[1] = mesh.geometry.skinIndices[vertexIndex].y;
                boneIndices[2] = mesh.geometry.skinIndices[vertexIndex].z;
                boneIndices[3] = mesh.geometry.skinIndices[vertexIndex].w;

                let weights = [];
                weights[0] = mesh.geometry.skinWeights[vertexIndex].x;
                weights[1] = mesh.geometry.skinWeights[vertexIndex].y;
                weights[2] = mesh.geometry.skinWeights[vertexIndex].z;
                weights[3] = mesh.geometry.skinWeights[vertexIndex].w;

                let inverses = [];
                inverses[0] = mesh.skeleton.boneInverses[boneIndices[0]];
                inverses[1] = mesh.skeleton.boneInverses[boneIndices[1]];
                inverses[2] = mesh.skeleton.boneInverses[boneIndices[2]];
                inverses[3] = mesh.skeleton.boneInverses[boneIndices[3]];

                let skinMatrices = [];
                skinMatrices[0] = mesh.skeleton.bones[boneIndices[0]].matrixWorld;
                skinMatrices[1] = mesh.skeleton.bones[boneIndices[1]].matrixWorld;
                skinMatrices[2] = mesh.skeleton.bones[boneIndices[2]].matrixWorld;
                skinMatrices[3] = mesh.skeleton.bones[boneIndices[3]].matrixWorld;

                var finalVector = new THREE.Vector4();
                for (var k = 0; k < 4; k++) {
                    var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
                    tempVector.multiplyScalar(weights[k]);
                    //the inverse takes the vector into local bone space
                    tempVector.applyMatrix4(inverses[k])
                        //which is then transformed to the appropriate world space
                        .applyMatrix4(skinMatrices[k]);
                    finalVector.add(tempVector);
                }
                output += '\t\t\tvertex ' + finalVector.x + ' ' + finalVector.y + ' ' + finalVector.z + '\n';
            }
        }
        output += '\t\tendloop\n';
        output += '\tendfacet\n';
    }

    return output
}
