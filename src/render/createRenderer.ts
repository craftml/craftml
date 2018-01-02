import { DomNode } from '../dom'
import Node from '../node'
import * as _ from 'lodash'

import * as iots from 'io-ts'

type PropTypes<T> = iots.Type<{}, T>

type RendererDefinition<T extends object> = {
    tagName: string,
    propTypes: PropTypes<T>,
    defaultProps: T,
    merge: boolean,
    getSaga: (node: Node, props: T, domNode: DomNode) => (() => {})
}

export type Renderer<T> = (node: Node, props: T, domNode: DomNode) => {}

export default function createRenderer<T extends object>(def: RendererDefinition<T>): Renderer<T> {

    return function* (node: Node, props: T, domNode: DomNode): {} {

        yield renderNode(def, node, props, domNode)

        return
    }
}

import resolve from './resolve'

function* renderNode<T extends object>(
    def: RendererDefinition<T>,
    node: Node, props: T, domNode: DomNode): {} {

    const resolvedProps = resolve(def.propTypes, props, def.defaultProps) as T

    // const k = (ps) => _.omit(ps, 'geometry')
    // console.log('props', k(props), k(def.defaultProps), '->', k(resolvedProps), def.propTypes.name)

    yield def.getSaga(node, resolvedProps, domNode)()

}