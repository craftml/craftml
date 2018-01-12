import Vertex from './Vertex'
import { FRONT, BACK, COPLANAR, SPANNING, EPSILON } from './constants'

export default class Polygon {

    vertices: Vertex[]
    normal?: Vertex
    w?: number

    constructor(vertices?: Vertex[], normal?: Vertex, w?: number) {
        if (!( vertices instanceof Array )) {
            vertices = [];
        }

        this.vertices = vertices;
        if (vertices.length > 0) {
            
            this.calculateProperties();

        } else {
            this.normal = this.w = undefined;
        }
    }

    calculateProperties() {
        var a = this.vertices[0],
            b = this.vertices[1],
            c = this.vertices[2];

        this.normal = b.clone().subtract(a).cross(
            c.clone().subtract(a)
        ).normalize();

        this.w = this.normal.clone().dot(a);

        return this;
    };

    clone() {
        var i, verticeCount,
            polygon = new Polygon();

        for (i = 0, verticeCount = this.vertices.length; i < verticeCount; i++) {
            polygon.vertices.push(this.vertices[i].clone());
        }
        polygon.calculateProperties();

        return polygon;
    }

    flip() {
        var i, vertices = [];
        if (this.normal && typeof this.w !== 'undefined') {

            this.normal.multiplyScalar(-1);
            this.w *= -1;

            for (i = this.vertices.length - 1; i >= 0; i--) {
                vertices.push(this.vertices[i]);
            }
            this.vertices = vertices;
        }
        return this;
    };

    classifyVertex(vertex: Vertex): number | null {
        if (this.normal && typeof this.w !== 'undefined') {
            var sideValue = this.normal.dot(vertex) - this.w;

            if (sideValue < -EPSILON) {
                return BACK;
            } else if (sideValue > EPSILON) {
                return FRONT;
            } else {
                return COPLANAR;
            }
        }
        return null
    }

    classifySide(polygon: Polygon) {
        var i, vertex, classification,
            numPositive = 0,
            numNegative = 0,
            verticeCount = polygon.vertices.length;

        for (i = 0; i < verticeCount; i++) {
            vertex = polygon.vertices[i];
            classification = this.classifyVertex(vertex);
            if (classification === FRONT) {
                numPositive++;
            } else if (classification === BACK) {
                numNegative++;
            }
        }

        if (numPositive > 0 && numNegative === 0) {
            return FRONT;
        } else if (numPositive === 0 && numNegative > 0) {
            return BACK;
        } else if (numPositive === 0 && numNegative === 0) {
            return COPLANAR;
        } else {
            return SPANNING;
        }
    }

    splitPolygon(
        polygon: Polygon, 
        coplanarFront: Polygon[], 
        coplanarBack: Polygon[], 
        front: Polygon[], 
        back: Polygon[]) {

        if (!this.normal || typeof this.w === 'undefined' || !polygon.normal) {            
            return
        }

        let classification = this.classifySide(polygon);

        if (classification === COPLANAR) {

            ( this.normal.dot(polygon.normal) > 0 ? coplanarFront : coplanarBack ).push(polygon);

        } else if (classification === FRONT) {

            front.push(polygon);

        } else if (classification === BACK) {

            back.push(polygon);

        } else {
            
            var verticeCount,
                i, j, ti, tj, vi, vj,
                t, v,
                f = [],
                b = [];

            for (i = 0, verticeCount = polygon.vertices.length; i < verticeCount; i++) {

                j = (i + 1) % verticeCount;
                vi = polygon.vertices[i];
                vj = polygon.vertices[j];
                ti = this.classifyVertex(vi);
                tj = this.classifyVertex(vj);

                if (ti !== BACK) {
                    f.push(vi);
                }
                if (ti !== FRONT) {
                    b.push(vi);
                }
                if (ti && tj && (ti | tj) === SPANNING) {
                // TODO: check if this is correct
                // if ( (ti === FRONT && tj === BACK) || (tj === BACK && ti === FRONT)
                    // || ti === SPANNING || tj === SPANNING) {
                    t = ( this.w - this.normal.dot(vi) ) / this.normal.dot(vj.clone().subtract(vi));
                    v = vi.interpolate(vj, t);
                    f.push(v);
                    b.push(v);
                }
            }

            if (f.length >= 3) {
                front.push(new Polygon(f).calculateProperties());
            }
            if (b.length >= 3) {
                back.push(new Polygon(b).calculateProperties());
            }
        }
    }
}