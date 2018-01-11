import { DomNode } from '../dom'
import Node from '../node'
import { update, refresh, parentOf } from './effects'

import * as t from 'io-ts'

type PropTypes<T> = t.Type<{}, T>

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

const htmlPropTypes = t.interface({
    id: t.string,
    class: t.string,
    style: t.string
})

function* renderNode<T extends object>(
    def: RendererDefinition<T>,
    node: Node, props: T, domNode: DomNode): {} {

    const parent: Node = yield parentOf(node)

    const inheritFromParent = (x: Node) => {

        // x = x.setMerge(def.merge)

        if (parent) {

            if (parent.context.params) {
                
                // x = x.setParams(parent.params)
                x = x.updateContext(ctx => ctx.setParams(parent.context.params))
            }            

            x = x.updateContext(ctx => ctx.setParts(parent.context.parts))

            if (parent.context.block) {
                x = x.updateContext(ctx => ctx.setBlock(parent.context.block))
            }

            x = x.updateContext(ctx => ctx.setStyleSheets(parent.context.styleSheets))
            
        }

        return x
    }

    yield update(node, inheritFromParent)
    
    node = yield refresh(node)

    const params = node.context.params.toJS()    

    const mergedPropTypes = t.intersection([def.propTypes, htmlPropTypes])

    const resolvedProps = resolve(mergedPropTypes, props, def.defaultProps, params) as T

    // const k = (ps) => _.omit(ps, 'geometry')
    // tslint:disable-next-line:max-line-length
    // console.log(`[${node.tagName}]`, 'types:', def.propTypes.name, 'props:', k(props), 'defaultProps:', k(def.defaultProps), 'params:', params, '->', k(resolvedProps))

    yield update(node, x =>  x.setProps(resolvedProps))
        // x.setMerge(resolvedProps.merge)
        //  x.setProps(resolvedProps))         

    yield update(node, x => x.computeStyle())

    node = yield refresh(node)    

    yield def.getSaga(node, resolvedProps, domNode)()

    yield update(node, n => n.setStatus('done'))

}