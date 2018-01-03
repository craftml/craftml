import * as _ from 'lodash'
import * as t from 'io-ts'

type PropTypes<T> = t.Type<{}, T>

const isTemplate = (v: string) => v.match(/{{(.*)}}/)

function resolveTemplateExpressions(props: {}, params: {}) {

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    return _.mapValues(props, value => {

        if (_.isString(value) && isTemplate(value)) {         
            const compiled = _.template(value)
            return compiled(params)
        } else {
            return value
        }
    })

}

function resolveTemplateExpression(value: string | {}, params: {}) {

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    if (_.isString(value) && isTemplate(value)) {         
        const compiled = _.template(value)
        return compiled(params)
    } else {
        return value
    }    
}

export default function resolveProps<T>(propTypes: PropTypes<T>, props: {}, defaultProps: {}, params: {}) {

    let resolvedProps = {}
    //...defaultProps, ...props}    

    // console.log('propTypes', propTypes, propTypes.is(props), _.keys(props))
    
    // resolvedProps = resolveTemplateExpressions(resolvedProps, params)

    const resolveByInterfaceType = (ps: t.InterfaceType<t.Props, T>) => {

        _.forEach(ps.props, (propType, propName) => {

            // TODO: handle no defualt prop (required)
            // let propValue = resolveTemplateExpression
            let resolvedPropValue = _.has(props, propName) ? props[propName] : defaultProps[propName]

            if (_.isString(resolvedPropValue)) {
                resolvedPropValue = resolveTemplateExpression(resolvedPropValue, params)
            }

            // automatic type conversion
            if (propType === t.number) {                

                resolvedPropValue = Number(resolvedPropValue)

            } else if (propType === t.boolean) {

                
                if (!_.isBoolean(resolvedPropValue)) {
                    
                    // <foo merge> --> { merge: '' }                    
                    resolvedPropValue = true
                } 
                // else

                    // <foo merge={true}/>

                    // do nothing, keep the value as is
                
            }
            
            resolvedProps[propName] = resolvedPropValue

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