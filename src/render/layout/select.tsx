import * as _ from 'lodash'
import Node from '../../node'
// import query from '../query'

function collectMergedTree(node: Node): Node[] {
    // if (node.has('children')){
    return _.flatten(node.children.map((c, i) => {
        // const childKey = c.childKey
        if (c.merge) {

            return collectMergedTree(c)

        } else {

            // return {node: c, path:[...path, 'children', i, 'offset']}
            return c

        }

    }))

    // } else {
    //
    //   return []
    //
}

// TODO: deal with situations when a selected node is a descendent of another
// selected node

// nodeState:Node, selectors:String => [Node]
export default function select(node: Node, selectors?: string): Node[] {

    if (!selectors) {
        // console.log('top', top)
        // const mergedTree = collectMergedTree(nodeState)
        // // console.log('mergedTree', mergedTree)
        // const selectedNodes = _.map(_.flattenDeep(mergedTree), 'node')
        // return selectedNodes
        return collectMergedTree(node)

    } else {

        // const $ = query(nodeState)

        let selectedNodes = []

        const parts = selectors.split(',')
        _.forEach(parts, part => {

            let moreNodes = node.$(part).get()
            // remove already selected
            moreNodes = _.differenceBy(moreNodes, selectedNodes, n => n.state)

            selectedNodes = selectedNodes.concat(moreNodes)

        })

        // const selectedNodes = $(selectors).get()
        // console.log('selectedNodes', _.map(selectedNodes, n=>n.get('tagName')))
        return selectedNodes
    }

}
