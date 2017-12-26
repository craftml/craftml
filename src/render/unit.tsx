import { React, DomNode, DOM } from '../dom'
import { NodeProps } from './index'
import Node from '../node'
import * as _ from 'lodash'

import { BoxGeometry, Matrix4 } from 'three'

export interface UnitProps extends NodeProps {
    size: string
}

import render from './index'

export default function* renderUnit(node: Node, props: UnitProps, domNode: DomNode): {} {

    const { size = '10 10 10' } = props
    const [ x, y, z ] = _.map(size.split(' '), Number)

    const geometry = new BoxGeometry(x, y, z)
    const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
    geometry.applyMatrix(matrix)

    const d = DOM(
        <craftml-group tagName="craftml-unit" merge={false} {...props}>
            <craftml-geometry geometry={geometry} dimensions={3}/>
        </craftml-group>
    )

    yield render(node, d)
}