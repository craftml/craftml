import * as _ from 'lodash'
import * as t from 'io-ts'

type PropTypes<T> = t.Type<{}, T>

const isTemplate = (v: string) => v.match(/{{(.*)}}/)

function resolveTemplateExpressions(props: {}, params: {}) {

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    return _.mapValues(props, value => {

        // let value = propValue
        if (_.isString(value) && isTemplate(value)) {         
            const compiled = _.template(value)
            return compiled(params)
        } else {
            return value
        }
    })

}

export default function resolveProps<T>(propTypes: PropTypes<T>, props: {}, defaultProps: {}, params: {}) {

    let resolvedProps = {...defaultProps, ...props}    
    
    resolvedProps = resolveTemplateExpressions(resolvedProps, params)

    const resolveByInterfaceType = (ps: t.InterfaceType<t.Props, T>) => {

        _.forEach(ps.props, (propValue, propName) => {

            // type conversion
            if (propValue === t.number) {

                resolvedProps[propName] = Number(resolvedProps[propName])
            }

        })
    }

    const _tag = (propTypes as {} as {_tag: string})._tag
    if (_tag === 'IntersectionType') {

        const c = propTypes as t.IntersectionType<t.Type<{}, {}>[], T>
        _.forEach(c.types, resolveByInterfaceType)

    } else if (_tag === 'InterfaceType') {

        const c = propTypes as t.InterfaceType<t.Props, T>
        resolveByInterfaceType(c)

    }

    // console.log('resolvedProps', resolvedProps)
    return resolvedProps
}