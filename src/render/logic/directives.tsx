import { React, DomNode, DOM } from '../../dom'
import Node from '../../node'
import * as _ from 'lodash'

// regular expression that matches
// s in [1, 2, 3]

const IN_PATTERN = /(.+)\s+in(.*)$/

export default function logic_directives(node: Node, repeat: number | string , component: DomNode) {    

    // derivate a new component that will remove the repeat attribute
    const restComponent = {
        ...component,
        attribs: {
            ...component.attribs,
            repeat: null
        }
    }

    // boolean function to check if a given string exists as the name of a parameter in the context
    const isAValidParameterName = (name: string) => node.parent && node.parent.context.params.has(name.trim())    

    if (typeof repeat === 'string') {

        const ts = repeat.match(IN_PATTERN)        
        
        if (ts && ts.length > 2) {

            const iteratorName = ts[1]
            const iterableExpression = ts[2]
            
            if (isAValidParameterName(iterableExpression)) {    
                
                //
                // repeat = 's in ss'
                //

                const iterable = iterableExpression.trim() // ' ss ' => 'ss'
             
                return DOM(
                    <craftml-foreach iterator={iteratorName} iterable={iterable}>                        
                        {restComponent}
                    </craftml-foreach>
                )

            } else {

                //
                // repeat = 's in [1, 2, 3]'
                //

                const iterableRandomName = _.uniqueId('$foreach_')
                const paramInjectionScript = `$params.${iterableRandomName} = ${iterableExpression}`

                return DOM(
                    <craftml-group merge={true}>
                        <script>{paramInjectionScript}</script>                        
                        <craftml-foreach iterator={iteratorName} iterable={iterableRandomName}>                        
                            {restComponent}
                        </craftml-foreach>
                    </craftml-group>)
            }

        }
        
    }

    const n = Number(repeat) || 1
    
    return DOM(<craftml-repeat n={n}>{restComponent}</craftml-repeat>)
}