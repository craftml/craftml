import Node from './index'
import * as _ from 'lodash'
import chalk from 'chalk'
import { Matrix4 } from 'three'
import * as _ from 'lodash'

// pretty-print a node and its descendents to console
export default function pp(node: Node, options: {} = {}) {
    const text = toStringRecursively(node)
    // tslint:disable-next-line:no-console
    console.log(text)
}

function toStringRecursively(node: Node, levels: number = 0): string {

    const indent = _.repeat('  ', levels)

    const self = indent + toString(node)

    const text = _.map(node.children, (c, i) => {
        return toStringRecursively(c, levels + 1)
    }).join('')

    return self + '\n' + text
}


//
// toString functions
//
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
    if (node.context && node.context.size  > 0) {
        return chalk.gray(JSON.stringify(node.context))
    } else {
        return ''
    }    
}

function toString(node: Node): string {
    // console.log('node', node)
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

    // str += ` [${node.path.join('.')}]`
    
    str += '' + context(node)

    //   // str += ` ${node.status}`

    //   str += ' ' + node.cssRules.size
    
    str += ' ' + matrix(node)

    //   str += ' ' + JSON.stringify(node.style)

    if (node.errors.length > 0) {
        str += ' ' + chalk.red('errors: ' + node.errors.length)
    }

    if (node.parts) {
        str += ' ' + chalk.cyan(node.parts.map((c, k) => k).toArray().join(','))
    }

    if (node.geometry && node.geometry.vertices) {
        str += ` g(${node.geometry.vertices.length}) ${node.dimensions}d`
    }

    return str
}
