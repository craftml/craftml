import Node from './index'
import * as _ from 'lodash'
import chalk from 'chalk'

// pretty-print a node and its descendents to console
export default function pp(node: Node, options: {} = {}) {
    const text = toStringRecursively(node)
    console.log(text)
}

function toStringRecursively(node: Node, levels: number = 0): string {

    const indent = _.repeat('  ', levels)

    const self = indent + toString(node)
    
    const text = _.map(node.children, (c, i) => {
    return toStringRecursively(c, levels + 1)
    }).join('')

    // const text = 'children'

    return self + '\n' + text
}

function toString(node: Node): string {
    // console.log('node', node)
    let tagName
    if (node.tagName.match(/^craftml-/)) {
        tagName = node.tagName.replace(/^craftml-/, '')
    } else {
        tagName = node.tagName
    }

    //   if (node.merge){
    //     tagName += '*'
    //   }

    //   let str
    //   if (node.tagName.match(/^craftml-/)){
    //     str = chalk.magenta(tagName)
    //   } else {
    //     str = chalk.magenta.bold(tagName)
    //   }

    let str = chalk.magenta(tagName)
    //   if (node.className){
    //     str += chalk.green(` .${node.className}`)
    //   }
    //   if (node.id){
    //     str += chalk.green(` #${node.id}`)
    //   }

    //   str += ` [${node.path.join('.')}]`

    //   str += node.context ? ` ${JSON.stringify(node.context)}` : ''

    //   // str += ` ${node.status}`

    //   str += ' ' + node.cssRules.size

    //   str += ' [' + node.matrix.elements.join(',') + ']'

    //   str += ' ' + JSON.stringify(node.style)

    //   if (node.errors.length > 0){
    //     str += ' ' + chalk.red('errors: ' + node.errors.length)
    //   }

    //   if (node.parts){
    //     str += ' ' + node.parts.map((c,k)=>k).toArray().join(',')
    //   }

    if (node.geometry && node.geometry.vertices){
        str += ` g(${node.geometry.vertices.length}) ${node.dimensions}d`
    }

    return str
}
