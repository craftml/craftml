const peg = require('../transform/peg-parser')
import * as _ from 'lodash'

export type Block = {
    method: string,
    args: {} | string
}

export type Frame = {
    blocks: Block[],
    selectors?: string
}

export default function parse(code: string): Frame[] {

    let blocks: Block[] = []
    try {
        // $FlowFixMe
        blocks = peg.parse(code)
    } catch (error) {
        throw 'there are syntax errors'
    }

    // console.log('blocks', blocks[0])

    const frames = split_blocks_into_context_frames(blocks)
    return frames
}

function split_blocks_into_context_frames(blocks: Block[]): Frame[] {

    // an array to collect frames
    const frames: Frame[] = []

    // create and push the first frame
    let currentFrame = {
        blocks: [],
        selectors: undefined
    }
    frames.push(currentFrame)

    _.forEach(blocks, block => {

        const { method, args } = block

        if (method === 'select' && typeof args === 'string') {

            // create a new frame
            currentFrame = {
                blocks: [],
                selectors: args
            }
            frames.push(currentFrame)

        } else {

            // add a block to the current frame
            currentFrame.blocks.push(block)

        }

    })

    // return only frames with at least 1 block
    return _.filter(frames, f => f.blocks.length > 0)
}
