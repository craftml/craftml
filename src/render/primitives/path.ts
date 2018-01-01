import createPrimitive from './createPrimitive'
import { Shape, Vector2 } from 'three'

import * as _ from 'lodash'
import * as t from 'io-ts'

type ContourPoint = number[]
type Contour = ContourPoint[]
type SVG = {}
type getContoursType = (svg: SVG) => Contour[]
type parseSVGType = (d: string) => SVG

const getContours: getContoursType = require('svg-path-contours')
const parseSVG: parseSVGType = require('parse-svg-path')

export default createPrimitive({
  tagName: 'path',
  defaultProps: {
    d: ''
  },
  propTypes: t.interface({
    d: t.string
  }),
  dimensions: 2,
  getGeometry: (props) => {
    const { d } = props

    const svg = parseSVG(d)
  
    // convert curves into discrete points
    const contours: Contour[] = getContours(svg)//
  
    const contour2Shape = (contour: Contour) => {
      const vectors = _.map(contour, pt => {
        const [x, y] = pt
        return new Vector2(x, y)
      })
      return new Shape(vectors)
    }
  
    const shapes = _.map(contours, contour2Shape)
    const geometries = _.map(shapes, shape => shape.createPointsGeometry(1))

    return geometries
  }
})
