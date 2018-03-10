declare namespace JSX {

    interface IntrinsicElements {
        'craftml-group': {
            merge?: boolean,
            tagName?: string
        },
        'craftml-geometry': {
            geometry: {},
            dimensions: number           
        },
        'craftml-transform': {
            t: string
        },
        'craftml-layout': {
            l: string
        },
        'craftml-repeat': {
            n: number | string,
        },
        'craftml-foreach': {
            iterator: string,            
            iterable: string
        },
        'craftml-module': {
            name: string
        },
        'g': {
            merge: boolean,
            tagName?: string
        },
        'dome': {    
            radius: number,
            height: number        
        }
    }

}
