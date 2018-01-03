import { DomNode } from '../dom'
import Node from '../node'
import * as _ from 'lodash'
import { update, refresh, parentOf } from './effects'

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

    const parent = yield parentOf(node)

    const updater = (x: Node) => {

        // x = x.setMerge(def.merge)

        if (parent) {

            if (parent.context) {
                
                x = x.setContext(parent.context)
            }

            x = x.setParts(parent.parts)
        }

        return x
    }

    yield update(node, updater)
    node = yield refresh(node)

    const params = node.context.toJS()
    
    // console.log('params', node.tagName, params)

    const resolvedProps = resolve(def.propTypes, props, def.defaultProps, params) as T
    const k = (ps) => _.omit(ps, 'geometry')
    // console.log(`[${node.tagName}]`, 'types:', def.propTypes.name, 'props:', k(props), 'defaultProps:', k(def.defaultProps), 'params:', params, '->', k(resolvedProps))

    // x = x.setMerge(def.merge)

    yield update(node, x => x.setMerge(resolvedProps.merge))
    node = yield refresh(node)

    yield def.getSaga(node, resolvedProps, domNode)()

}