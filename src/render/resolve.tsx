import * as _ from 'lodash'
import * as t from 'io-ts'

type PropTypes<T> = t.Type<{}, T>

export default function resolveProps<T>(propTypes: PropTypes<T>, props: {}, defaultProps: {}) {

    const resolvedProps = {...defaultProps, ...props}

    // console.log('propTypes', resolvedProps)

    const resolveByInterfaceType = (ps: t.InterfaceType<t.Props, T>) => {

        _.forEach(ps.props, (propValue, propName) => {

            // console.log('propName', propName)

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