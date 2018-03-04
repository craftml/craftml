import { React, DomNode, DOM } from '../../dom'
import { render } from '../effects'
import Node from '../../node'
import * as _ from 'lodash'
// import makeRenderSagaCreator from '../makeRenderSagaCreator'
import { Geometry } from 'three'

import * as iots from 'io-ts'
export type PropTypes<A> = iots.Type<{}, A>

export type PrimitiveDefinition<T extends object> = {
    tagName: string,
    propTypes: PropTypes<T>,
    defaultProps: T,
    getGeometry: (props: T) => Geometry | Geometry[],
    dimensions: number
}

function wrap_t(component: DomNode, t: string): DomNode {
    return DOM(<craftml-transform t={t}>{component}</craftml-transform>)
}

import createRenderer, { } from '../createRenderer'

type Saga = () => {}
type GetSaga<T> = (node: Node, props: T, domNode: DomNode) => Saga

export default function createPrimitive<T extends object>(def: PrimitiveDefinition<T>) {

    const commonPropTypes = iots.interface({
        t: iots.object, // do not resolve {{ }}
        repeat: iots.string
    })

    const mergedPropTypes = iots.intersection([def.propTypes, commonPropTypes])
    
    type T1 = iots.TypeOf<typeof mergedPropTypes>

    const mergedDefaultProps: T1 = {...def.defaultProps as object, t: ''} as {} as T1

    const getSaga: GetSaga<T1> = (node, props, domNode) => function* () {

        const geometryProps = props
        
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

        wrapped = wrap_t(wrapped, props.t)
        
        const htmlProps = _.pick(props, ['id', 'class', 'style'])

        wrapped = DOM(
            <craftml-group tagName={def.tagName} merge={false} {...htmlProps}>
                {wrapped}
            </craftml-group>)
        
        // // const PrimitiveProps = iots.interface(def.propTypes)
        // const validation = iots.validate(props, def.propTypes)
        // if (validation.isLeft()) {
        //     // TODO: report error
        //     // example: https://github.com/OliverJAsh/io-ts-reporters/blob/master/src/index.ts
        //     console.error(PathReporter.report(validation))
        // }
        
        yield render(node, wrapped)
    }

    return createRenderer({
        tagName: def.tagName,
        propTypes: mergedPropTypes,
        defaultProps: mergedDefaultProps,
        merge: false,
        getSaga,
    })

}