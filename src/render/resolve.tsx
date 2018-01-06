import * as _ from 'lodash'
import * as t from 'io-ts'

type PropTypes<T> = t.Type<{}, T>

// check if the given string contains any template expression (i.e., {{ }})
const isTemplate = (v: string) => v.match(/{{(.*)}}/)

function resolveTemplateExpression(value: string | {}, params: {}) {

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    if (_.isString(value) && isTemplate(value)) {         
        const compiled = _.template(value)
        return compiled(params)
    } else {
        return value
    }    
}

// tslint:disable-next-line:no-any
type PropTypeIterator =  (propType: t.Type<any, any>, propName: string) => void

// get a function to set the property of 'resolvedProps' for each propType and propName
const setPerPropType = (resolvedProps: {}, clientProps: {}, defaultProps: {}, contextParams: {}): PropTypeIterator => 

    (propType, propName) => {

        // TODO: handle no defualt prop (required)
        // let propValue = resolveTemplateExpression
        let resolvedPropValue = _.has(clientProps, propName) ? clientProps[propName] : defaultProps[propName]

        if (_.isString(resolvedPropValue)) {
            resolvedPropValue = resolveTemplateExpression(resolvedPropValue, contextParams)
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

    }

export default function resolveProps<T>(propTypes: PropTypes<T>, props: {}, defaultProps: {}, params: {}) {

    // make everything in params avaliabile in resolvedProps by default
    // assumptions: 
    ///    params should come from the parent and should already have the right types   
    let resolvedProps = {...params}     

    // then override by clientProps, defaultProps according to propTypes    
    const resolvePerPropType = setPerPropType(resolvedProps, props, defaultProps, params)

    const resolvePerInterfaceType = (ps: t.InterfaceType<t.Props, T>) => _.forEach(ps.props, resolvePerPropType) 

    const _tag = (propTypes as {} as {_tag: string})._tag
    if (_tag === 'IntersectionType') {

        const c = propTypes as t.IntersectionType<t.Type<{}, {}>[], T>
        _.forEach(c.types, resolvePerInterfaceType)

    } else if (_tag === 'InterfaceType') {

        const c = propTypes as t.InterfaceType<t.Props, T>
        resolvePerInterfaceType(c)

    }

    // console.log('resolvedProps', resolvedProps)
    return resolvedProps
}