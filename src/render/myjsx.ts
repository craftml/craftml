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
            n: number
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
