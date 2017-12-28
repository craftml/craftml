import { React, DomNode, DOM } from '../../dom'
import { render } from '../effects'
import Node from '../../node'
import * as _ from 'lodash'
// import makeRenderSagaCreator from '../makeRenderSagaCreator'
import { Geometry } from 'three'

type PrimitiveDefinition<T> = {
    tagName: string,
    defaultProps: T,
    getGeometry: (props: T) => Geometry | Geometry[],
    dimensions: number
}

function wrap_t(component: DomNode, t: string) {
    return <craftml-transform t={t}>{component}</craftml-transform>
}

function wrap_repeat(component: DomNode, props: { repeat: number | string }) {

    // const { n = 1 } = props
    // if (typeof props.repeat === 'number')

    const n = props.repeat
    // $FlowFixMe
    return <craftml-repeat n={n}>{component}</craftml-repeat>
}

export default function createPrimitive<T>(def: PrimitiveDefinition<T>) {

    // yield call()
    return function* (node: Node, props: T, domNode: DomNode): {} {

        yield renderPrimitive(def, node, props, domNode)

        return
    }
}

export type PrimitiveProps = {
    t: string,    
}

function* renderPrimitive<T>
    (def: PrimitiveDefinition<T>, node: Node, props: T, domNode: DomNode) {
    
    const geometryProps = _.defaults(props, def.defaultProps)
    const geometry = def.getGeometry(geometryProps)
    const dimensions = def.dimensions
    
    let wrapped: DomNode

    if (Array.isArray(geometry)) {
        wrapped = DOM(
        <craftml-group merge={false}>
            {_.map(geometry, g => <craftml-geometry geometry={g} dimensions={dimensions} />)}
        </craftml-group>
        )
    } else {
        wrapped = DOM(<craftml-geometry geometry={geometry} dimensions={dimensions} />)
    }

    // const htmlProps = _.pick(props, ['id','class','style','merge'])

    wrapped = wrap_t(wrapped, props.t)

    // wrapped = <craftml_group tagName={def.tagName} {...htmlProps}>
    //   { wrapped }
    // </craftml_group>

    wrapped = DOM(
        <craftml-group tagName={def.tagName} merge={false}>
            {wrapped}
        </craftml-group>)

    // wrapped = wrap_repeat(wrapped, props)

    // console.log('wrapped', wrapped)

    // yield call(render(nodux.child(0), DOM(wrapped)))

    yield render(node, wrapped)

    // yield call(render(nodux, DOM(wrapped)))

}