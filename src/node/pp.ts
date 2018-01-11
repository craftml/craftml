import Node from './index'
import * as _ from 'lodash'
import chak from 'chalk'
const ansiHTML = require('ansi-html');
import { Matrix4 } from 'three'
import { Declaration, CssRule } from '../render/css/index';

const chalk = new chak.constructor({level: 3});

// pretty-print a node and its descendents to console
export default function pp(node: Node, options: {} = {}) {
    const text = toStringRecursively(node)
    // tslint:disable-next-line:no-console
    console.log(text)
}

export function pps(node: Node) {
    return toStringRecursively(node)   
}

export function html(node: Node) {
    return ansiHTML(toStringRecursively(node, 0, '<br/>', '&nbsp;&nbsp;&nbsp;&nbsp;'))
}

function toStringRecursively(node: Node, levels: number = 0, changeLine: string = '\n', tab: string = '  '): string {

    const indent = _.repeat(tab, levels)

    const self = indent + toString(node)

    const text = _.map(node.children, (c, i) => {
        return toStringRecursively(c, levels + 1, changeLine, tab)
    }).join('')

    return self + changeLine + text
}

//
// toString functions
//

function path(node: Node): string {
    return `[${node.path.join('.')}]`
}

function matrix(node: Node): string {
    // if matrix is identity
    if (node.matrix.equals(new Matrix4())) {
        // show nothing
        return ''
    } else {
        return chalk.red('[' + node.matrix.elements.join(',') + ']')
    }
}

function context(node: Node): string {
    if (node.context.params && node.context.params.size > 0) {
        return chalk.gray(JSON.stringify(node.context.params))            
    } else {
        return ''
    }
}

function style(node: Node): string {

    if (_.keys(node.style).length > 0) {
        return chalk.red(JSON.stringify(node.style))
    } else {
        return ''
    }
}

function styleSheets(node: Node): string {

    const ruleStyler = (rule: CssRule) =>
        (text: string) => node.isSelectedBy(rule.selectors.join(',')) ?
            chalk.red.dim(text) : chalk.dim(text)

    const ruleView = (rule: CssRule) => ruleStyler(rule)
        (rule.selectors.join(' ') + ' {' + rule.declarations.map(delcarationView).join(', ') + '}')

    const delcarationView = (decl: Declaration) => decl.property + ': ' + decl.value

    node.isSelectedBy('craftml-unit')

    return chalk.bgRgb(20, 20, 20)(node.styleSheets.map(v => v.rules.map(ruleView).join('; ')).join('; '))
}

function geometry(node: Node): string {
    if (node.geometry && node.geometry.vertices) {
        return chalk.yellow(` g(${node.geometry.vertices.length}) ${node.dimensions}d`)
    } else {
        return ''
    }
}

function parts(node: Node): string {
    if (node.context.parts) {
        // return chalk.cyan(node.parts.keySeq().toArray().join(',')) +
        return chalk.cyan(node.context.parts.keySeq().toArray().join(','))
    } else {
        return ''
    }    
}

function errors(node: Node): string {
    if (node.errors.length > 0) {
        return chalk.red(`${node.errors.length} error(s)`)
    } else {
        return ''
    }
}

// ================================================
//

const DefaultOptions = {
    path: false,
    context: true,
    matrix: true,
    geometry: true,
    style: true,
    styleSheets: false,
    parts: true,
    errors: true
}

const Viewers = {
    path,
    context,
    matrix,
    geometry,
    style,
    styleSheets,
    parts,
    errors
}

function toString(node: Node, enabled: {} = DefaultOptions): string {

    let tagName
    if (node.tagName.match(/^craftml-/)) {
        tagName = node.tagName.replace(/^craftml-/, '')
    } else {
        tagName = node.tagName
    }

    if (node.merge) {
        tagName += '*'
    }

    let str
    if (node.tagName.match(/^craftml-/)) {
        str = chalk.magenta(tagName)
    } else {
        str = chalk.magenta.bold(tagName)
    }

    // let str = chalk.magenta(tagName)
    if (node.className) {
        str += chalk.green(` .${node.className}`)
    }
    if (node.id) {
        str += chalk.green(` #${node.id}`)
    }

    str += ' ' + _(Viewers)
        .filter((v, k) => enabled[k])
        .map(v => v(node))
        .compact()
        .value()
        .join(' ')

    // if (node.errors.length > 0) {
    //     str += ' ' + chalk.red('errors: ' + node.errors.length)
    // }

    return str
}
