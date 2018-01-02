import Node from '../../node'
// import { Map } from 'immutable'
import * as _ from 'lodash'

import select from './select'
// import join from './join'
import flow from './flow'
import reverse from './reverse'
import { align, center } from './align'
// const VALID_LAYOUT_METHODS: { [string]: any } = {

const VALID_LAYOUT_METHODS = {
    //   join,
    align,
    center,
    flow,
    reverse
}

import parse, { Frame, Block } from './parse'

export default function layoutEval(node: Node, expression: string): Node {

    const frames = parse(expression)

    const updaters = _.map(frames, f => create_updater_from_frame(f))

    return _.flow(updaters)(node)
}

type Updater = (n: Node) => Node

function create_updater_from_frame(frame: Frame): Updater {

    const { blocks, selectors } = frame

    return (node) => {

        // const nodeState_N = normalizeMatrix(nodeState)
        //
        const nodes = select(node, selectors)
        // console.log('nodes', nodes)
        const layoutFunction = compose_layout_function(blocks)

        const offsets = compute_layout_offsets(nodes, layoutFunction)

        const translatedNodes = _.map(offsets, ({ x, y, z }, i) => {
            return nodes[i].translate(x, y, z)
        })

        const updaters: Updater[] = _.map(translatedNodes, c => {
            return (n: Node) => n.setSubtree(c)
        })

        return _.flow(updaters)(node)
    }
}

import { Box } from '../../node'

type LayoutFunction = (boxes: Box[]) => Box[]

function compose_layout_function(blocks: Block[]): LayoutFunction {

    const layoutFunctions = _.map(blocks, block => {

        const method = VALID_LAYOUT_METHODS[block.method]

        return (boxes: Box[]) => method(boxes, block.args)

    })

    const compositeLayoutFunction = (boxes: Box[]) => {

        const indexedBoxes = _.map(boxes, (box, i) => {
            let ibox = _.cloneDeep(box)
            ibox.index = i
            return ibox
        })

        const outputBoxes = _.flow(layoutFunctions)(indexedBoxes)
        return _.sortBy(outputBoxes, 'index')
        // return indexedBoxes
    }

    return compositeLayoutFunction
}

type Offset = {
    x: number,
    y: number,
    z: number,
}

function compute_layout_offsets(nodes: Node[], layoutFunction: LayoutFunction): Offset[] {

    const boxes = _.map(nodes, node => node.layout)

    const newBoxes = layoutFunction(boxes)

    const offsets = _.map(_.zip(newBoxes, boxes), ([b1, b2]) => {
        return {
            x: b1.position.x - b2.position.x,
            y: b1.position.y - b2.position.y,
            z: b1.position.z - b2.position.z,
        }
    })

    return offsets
}
