export type CssDefault = {
    parse: (text: string) => { stylesheet: StyleSheet }
}

const css: CssDefault = require('./vendor/css')
export const parse = css.parse

import { Adapter } from '../../query/createAdapter'
interface CSSSelectType {
    is<T>(x: T, selectors: string, options: { adapter: Adapter<T> }): boolean
}

const CSSSelect: CSSSelectType = require('css-select')

export const is = CSSSelect.is

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