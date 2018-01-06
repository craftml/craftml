import * as _ from 'lodash'

export interface DomNode {
    type: string,
    name: string,
    attribs: Attribs,
    data?: string,
    children: Array<DomNode>    
}

export interface Attribs {
    title?: string
    style?: string
}

export const React = {

    createElement(type: string, props: {}, ...children: DomNode[] ): DomNode {        

        // console.log('type', type, 'children', children)//, 'props', props)

        let childrenArray: DomNode[]

        if (Array.isArray(children)) {

            childrenArray = children

        // } else if (typeof children === 'string') {

        //     childrenArray = [{ data: children}]

        } else if ( children ) {

            childrenArray = children

        } else {

            childrenArray = []
        }

        // console.log('children', childrenArray)

        childrenArray = _.flatten(childrenArray)

        childrenArray = _.map(childrenArray, c => {

            // console.log('c', c)

            if (_.isString(c)) {
                
                return {
                    type: 'text',
                    data: c
                }
                 
            } else {

                return c
            }
        })

        const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
        childrenArray = childrenArray.filter(isNonEmpty)
        // console.log('children', childrenArray.length)
        return {
            type: 'tag', 
            name: type,
            attribs: props, 
            children: childrenArray,
        } as DomNode
    }

}

// function to trick ts to think <craftml-xxx/> as a valid DomNode
export function DOM(element: JSX.Element): DomNode {    
    const ret: DomNode = element as {} as DomNode   // force element to be of type DomNode
    return ret
}
