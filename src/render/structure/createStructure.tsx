import { React, DomNode, DOM } from '../../dom'
import { render } from '../effects'
import Node from '../../node'
import * as _ from 'lodash'

import * as iots from 'io-ts'

type StructurePropTypes = {
    spacing?: number
    t: string,
    l: string,
    repeat: string,
    tagName?: string
}
type StructureDefinition = {
    tagName: string,
    l: (props: StructurePropTypes) => string    
}

function wrap_t(component: DomNode, t: string): DomNode {
    return DOM(<craftml-transform t={t}>{component}</craftml-transform>)
}

function wrap_repeat(component: DomNode, props: { repeat: number | string }): DomNode {

    // const { n = 1 } = props
    // if (typeof props.repeat === 'number')

    const n = Number(props.repeat)
    // console.log('n', n)
    // $FlowFixMe
    return DOM(<craftml-repeat n={n}>{component}</craftml-repeat>)
}

import createRenderer, { } from '../createRenderer'

type Saga = () => {}
type GetSaga<T> = (node: Node, props: T, domNode: DomNode) => Saga

const propTypes = iots.interface({
    l: iots.string,
    t: iots.string,
    repeat: iots.string,
    tagName: iots.string,    
    spacing: iots.number
})

const defaultProps = {
    l: '',
    t: '',
    repeat: '',
    spacing: 0
}

export default function createStructure(def: StructureDefinition) {
    
    const getSaga: GetSaga<StructurePropTypes> = (node, props, domNode) => function* () {

        const { l } = def
        const customLayoutExpression = props.l
        const t = props.t
    
        const layoutExpression = l(props) + ';' + customLayoutExpression
        
        const htmlProps = _.pick(domNode.attribs, ['id', 'class', 'style', 'merge'])
    //     let wrapped = <craftml_group customTagName={customTagName} {...htmlProps}>
    //     <craftml_transform t={t}>
    //       <craftml_layout l={layoutExpression}>
    //         { children }
    //       </craftml_layout>
    //     </craftml_transform>
    //   </craftml_group>

        // this allows the tagName to be overriden by one specified in the tag attribute
        // <g tagName="foo"> --> props.tagName
        // <g/>  --> def.tagName                    
        let tagName = props.tagName || def.tagName

        let wrapped = DOM(
            <craftml-group tagName={tagName} merge={false} {...htmlProps}>
                <craftml-transform t={t}>
                    <craftml-layout l={layoutExpression}>
                        {domNode.children}
                    </craftml-layout>
                </craftml-transform>
            </craftml-group>
        )

        wrapped = wrap_repeat(wrapped, props)
    
        yield render(node, wrapped)
    }

    return createRenderer({
        tagName: def.tagName,
        propTypes,
        defaultProps,
        merge: false,
        getSaga,
    })

}