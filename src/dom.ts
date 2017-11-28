export interface DomNode {
    type: string,
    name: string,
    attribs: Attribs,
    data?: string,
    children: Array<DomNode>
}

export interface Attribs {
}

export const React = {

    createElement(type: string, props: {}, children: Array<DomNode>  | DomNode ): DomNode {        

        let childrenArray: Array<DomNode>

        if (Array.isArray(children)) {

            childrenArray = children

        } else if (children) {

            childrenArray = [children]

        } else {

            childrenArray = []
        }

        return {
            type: 'tag', 
            name: type,
            attribs: props, 
            children: childrenArray,
        } as DomNode
    }

}

export function DOM(element: JSX.Element): DomNode {
    // console.log('element', element)    
    return element    
}
