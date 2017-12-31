export interface DomNode {
    type: string,
    name: string,
    attribs: Attribs,
    data?: string,
    children: Array<DomNode>    
}

export interface Attribs {
    title?: string
}

export const React = {

    createElement(type: string, props: {}, children: DomNode[]  | DomNode ): DomNode {        

        let childrenArray: DomNode[]

        if (Array.isArray(children)) {

            childrenArray = children

        } else if (children) {

            childrenArray = [children]

        } else {

            childrenArray = []
        }

        const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
        childrenArray = childrenArray.filter(isNonEmpty)
        // console.log('children', childrenArray)
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
