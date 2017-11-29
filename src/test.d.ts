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