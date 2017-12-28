declare namespace JSX {

    interface IntrinsicElements {
        'craftml-group': {
            merge: boolean,
            tagName?: string 
        },
        'craftml-geometry': {
            geometry: {},
            dimensions: number           
        },
        'craftml-transform': {
            t: string
        }
    }

}
