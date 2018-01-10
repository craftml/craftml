import * as THREE from 'three'
import Polygon from './Polygon'
import { BACK } from './constants'

export default class Node {

    polygons: Polygon[]
    divider: Polygon
    front?: Node
    back?: Node

    constructor(polygons?: Polygon[]) {
        let i, polygonCount,
            front: Polygon[] = [],
            back: Polygon[] = [];

        this.polygons = [];
        this.front = this.back = undefined;

        if (!(polygons instanceof Array) || polygons.length === 0) {
            return;
        } 

        this.divider = polygons[0].clone();

        for (i = 0, polygonCount = polygons.length; i < polygonCount; i++) {
            this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }        

        if (front.length > 0) {
            this.front = new Node(front);
        }

        if (back.length > 0) {
            this.back = new Node(back);
        }
        
        // console.log('in', polygons.length, ' out', this.allPolygons().length)
        // console.log('input', polygons.length, 'front', front.length, 'back', back.length, 'this', this.polygons.length)
        // console.log('all', this.allPolygons().length,
        //     'front', this.front ? this.front.allPolygons().length : 0,
        //     'back', this.back ? this.back.allPolygons().length : 0)

        // )

    }

    isConvex(polygons: Polygon[]) {
        var i, j;
        for (i = 0; i < polygons.length; i++) {
            for (j = 0; j < polygons.length; j++) {
                if (i !== j && polygons[i].classifySide(polygons[j]) !== BACK) {
                    return false;
                }
            }
        }
        return true;
    }

    build(polygons: Polygon[]) {
        let i, polygonCount,
            front: Polygon[] = [],
            back: Polygon[] = [];

        if (!this.divider) {
            this.divider = polygons[0].clone();
        }

        for (i = 0, polygonCount = polygons.length; i < polygonCount; i++) {
            this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (front.length > 0) {
            if (!this.front) {
                this.front = new Node();
            } 
            this.front.build(front);
        }

        if (back.length > 0) {
            if (!this.back) {
                this.back = new Node();
            }
            this.back.build(back);
        }
    };

    allPolygons() {
        var polygons = this.polygons.slice();
        if (this.front) { 
            polygons = polygons.concat(this.front.allPolygons());
        }
        if (this.back) {
            polygons = polygons.concat(this.back.allPolygons());
        }        
        return polygons;
    };

    clone() {
        var node = new Node();

        node.divider = this.divider.clone();
        node.polygons = this.polygons.map((polygon: Polygon) => {
            return polygon.clone();
        });
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();

        return node;
    };

    invert() {
        var i, polygonCount, temp;

        for (i = 0, polygonCount = this.polygons.length; i < polygonCount; i++) {
            this.polygons[i].flip();
        }

        this.divider.flip();
        if (this.front) {
            this.front.invert();
        }
        if (this.back) {
            this.back.invert();
        }

        temp = this.front;
        this.front = this.back;
        this.back = temp;

        return this;
    };

    clipPolygons(polygons: Polygon[]) {
        var i, polygonCount,
            front: Polygon[], back: Polygon[];

        if (!this.divider) {
            return polygons.slice();
        }

        front = [], back = [];

        for (i = 0, polygonCount = polygons.length; i < polygonCount; i++) {
            this.divider.splitPolygon(polygons[i], front, back, front, back);
        }

        if (this.front) {
            front = this.front.clipPolygons(front);
        }
        
        if (this.back) {
            back = this.back.clipPolygons(back);
        } else {
            back = [];
        }

        return front.concat(back);
    };

    clipTo(node: Node) {
        this.polygons = node.clipPolygons(this.polygons);
        if (this.front) {
            this.front.clipTo(node);
        }
        if (this.back) {
            this.back.clipTo(node);
        }
    };
}
