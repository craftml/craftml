import * as _ from 'lodash'

const IMPATH = (p: string[]): string[] => _.reduce(p, (ret: string[], e: string, i) => {
    ret.push('children')
    ret.push(e)
    return ret
},
                                                   [])

import Node from '../node'

export interface Adapter<Elem> {
    getParent(elem: Elem): Elem
    removeSubsets(elems: Elem[]): Elem[]
}

export function createAdapter(topNode: Node): Adapter<Node> {

    const rootPathOffset = topNode.path.length
    
    // get the parent of the node
    const getParent = (node: Node) => {
        // console.log('getParent:node', node.tagName)        
        const path = node.path
        if (path.length > rootPathOffset) {
            const parentPath = _.slice(path, rootPathOffset, path.length - 1)
            // console.log('getParent:node parentPath', parentPath)
            const impath = IMPATH(parentPath)
            return new Node(topNode.state.getIn(impath))
        }
        return null
    }

    // takes an array of nodes, and removes any duplicates, as well as any nodes
    // whose ancestors are also in the array
    function removeSubsets(nodes: Array<Node | null>) {
        // console.log('removeSubsets:nodes', nodes)
        let idx = nodes.length, node, ancestor, replace;

        // Check if each node (or one of its ancestors) is already contained in the
        // array.
        while (--idx > -1) {
            node = ancestor = nodes[idx];

            // Temporarily remove the node under consideration
            nodes[idx] = null;
            replace = true;

            while (ancestor) {
                if (nodes.indexOf(ancestor) > -1) {
                    replace = false;
                    nodes.splice(idx, 1);
                    break;
                }
                ancestor = getParent(ancestor)
            }

            // If the node has been found to be unique, re-insert it.
            if (replace) {
                nodes[idx] = node;
            }
        }

        return nodes;
    }

    // get the node's children
    function getChildren(node: Node) {
        // console.log('getChildren:node', node.path)
        // return node.has('children') ? node.get('children').map(c => c).toArray() : []
        return node.children
    }

    // finds all of the element nodes in the array that match the test predicate,
    // as well as any of their children that match it
    function findAll(test: (n: Node) => boolean, nodes: Node[]): Node[] {
        // console.log('findAll:nodes', nodes)

        // console.log('input nodes', nodes)
        const matchedDescendentNodes = _.flatten(_.map(nodes, (c) => findAll(test, getChildren(c))))

        // console.log('matchedDescendentNodes', matchedDescendentNodes)
        const allMatchedNodes = _.filter(nodes, test).concat(matchedDescendentNodes)
        // console.log('allMatchedNodes', allMatchedNodes)
        return allMatchedNodes
    }

    const adapter = {
        // is the node a tag?
        isTag: (node: Node) => {
            // console.log('isTag:node', node)
            return true
        },

        // does at least one of passed element nodes pass the test predicate?
        existsOne: (test: (n: Node) => boolean, elems: Node[]) => _.some(elems, test),

        // get the attribute value
        getAttributeValue: (elem: Node, name: string) => elem.props[name],

        // get the node's children
        getChildren,

        // get the name of the tag
        getName: (elem: Node) => {
            // console.log('getName:elem', elem.path)            
            return elem.tagName
        },

        // get the parent of the node
        getParent,

        /*
          get the siblings of the node. Note that unlike jQuery's `siblings` method,
          this is expected to include the current node as well
        */
        getSiblings: (node: Node): Node[] => {
            const p = getParent(node)
            if (p) {
                return getChildren(p)
            } else {
                return [node]
            }
        },

        // get the text content of the node, and its children if it has any
        getText: (node: Node) => '',

        // does the element have the named attribute?
        hasAttrib: (node: Node, name: string) => _.has(node.props, name),

        // takes an array of nodes, and removes any duplicates, as well as any nodes
        // whose ancestors are also in the array
        removeSubsets,

        // finds all of the element nodes in the array that match the test predicate,
        // as well as any of their children that match it
        findAll,

        // finds the first node in the array that matches the test predicate, or one
        // of its children
        findOne: (test: (n: Node) => boolean, elems: Node[]) => {
            // console.log('findOne:elems', elems)
            return _.find(elems, test)
        },

        /*
          The adapter can also optionally include an equals method, if your DOM
          structure needs a custom equality test to compare two objects which refer
          to the same underlying node. If not provided, `css-select` will fall back to
          `a === b`.
        */
        equals: (a: Node, b: Node) => a === b
    }

    return adapter
}
