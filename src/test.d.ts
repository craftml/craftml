declare class Parser {
    
    constructor(handler: any, options: any);
    
}

declare module "htmlparser2" {
    
    class HtmlParser {
        
        method1(): string;

        static Parser: typeof Parser        

    }

    // default c



    export = HtmlParser
}

// declare module "svg-path-contours" {

//     type ContourPoint = number[]
//     export type Contour = ContourPoint[]
    
//     function main(svg: {}): Contour[]

//     export default main
// }

// declare module "parse-svg-path" {

//     function main(d: string): {}

//     export default main
// }