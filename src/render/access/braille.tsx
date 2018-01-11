import { React, DomNode, DOM } from '../../dom'
import { render } from '../effects'
import * as _ from 'lodash'
import * as t from 'io-ts'

// hard-coded params per official Braille dimensions
const dotDistance = 2.5   // between two dot centers
const dotDiameter = 1.2
const dotHeight = 0.5
const charSpacing = 2.3   // spacing between two consecutive chars (6-2.5-1.2)
const charWidth = dotDiameter * 2 + (dotDistance - dotDiameter)

import bitmap from './bitmap'

function render_character(char: string) {

    const bs = bitmap(char)
    let parts: DomNode[] = []

    if (bs) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const loc = i * 2 + j
                const b = bs[loc]
                const dx = j * dotDistance
                const dy = i * dotDistance
                if (b) {

                    const dot = DOM(
                        <craftml-transform t={`translate ${dx} ${dy} 0;`}>
                            <dome radius={dotDiameter / 2} height={dotHeight} />
                        </craftml-transform>
                    )
                    parts.push(dot)

                }
            }
        }

        return DOM(
            <craftml-group merge={false}>
                {parts}
            </craftml-group>)

    } else {

        return DOM(<craftml-group/>)

    }

}

import createRenderer from '../createRenderer'

export default createRenderer({
    tagName: 'braille',
    defaultProps: {
    },
    propTypes: t.interface({
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {

        let text = domNode.children && domNode.children[0].data || ''

        text = text.toUpperCase()        

        const characters = _.map(text, (c, i) => {
            const character = render_character(c)
            const xoffset = (charWidth + charSpacing) * i + charSpacing
            return DOM(
                <craftml-transform t={`translate ${xoffset} 0 0`}>
                    {character}
                </craftml-transform>
            )
        })

        const brailleLine = DOM(<craftml-group merge={false}>{characters}</craftml-group>)

        yield render(node.child(0), brailleLine)
    }
})
