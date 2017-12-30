import { DomNode } from '../dom'
import Node from '../node'
import * as _ from 'lodash'

import * as iots from 'io-ts'

type PropTypes = iots.InterfaceType<{}, {}>
type RendererDefinition<T extends PropTypes> = {
    tagName: string,
    propTypes: T,
    defaultProps: iots.TypeOf<T>,
    merge: boolean
    getSaga: (node: Node, props: iots.TypeOf<T>, domNode: DomNode) => (() => {})
}

export default function createRenderer<T extends PropTypes>(def: RendererDefinition<T>) {

    return function* (node: Node, props: T, domNode: DomNode): {} {

        yield renderNode(def, node, props, domNode)

        return
    }
}

function resolveProps(propTypes: PropTypes, props: {}, defaultProps: {}) {

    const resolvedProps = _.defaults(props, defaultProps)
    // console.log('propTypes', propTypes)
    _.map(propTypes.props, (propValue, propName) => {

        // type conversion
        if (propValue === iots.number) {

            resolvedProps[propName] = Number(props[propName])
        }

    })

    // console.log('resolvedProps', resolvedProps)
    return resolvedProps
}

function* renderNode<T extends PropTypes>(
    def: RendererDefinition<T>,
    node: Node, props: T, domNode: DomNode): {} {

    const resolvedProps = resolveProps(def.propTypes, props, def.defaultProps) as T

    console.log('props', props, '->', resolvedProps)
// 
    yield def.getSaga(node, resolvedProps, domNode)()
    // yield render(node, null)
}