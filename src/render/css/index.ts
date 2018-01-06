export type CssDefault = {
    parse: (text: string) => {stylesheet: StyleSheet }
}

export class Declaration {
    type: 'declaration';
    property: string;
    value: string;
}

export class CssRule {
    type: string;
    selectors: string[];
    declarations: Declaration[];
}

export class StyleSheet {
    rules: CssRule[];
    // tslint:disable-next-line:no-any
    parsingErrors: Array<any>;
}