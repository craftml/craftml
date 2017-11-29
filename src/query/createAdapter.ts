import * as _ from 'lodash'

const IMPATH = (p) => _.reduce(p, (ret, e, i) => {
    ret.push('children')
    ret.push(e)
    return ret
}, [])

import Node from '../node'

export function createAdapter(topNode: Node) {

    // console.log('createAdapter', state.get('path'))

    // get the parent of the node
    // let getParent

    const rootPathOffset = topNode.path.length

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
    function removeSubsets(nodes) {
        console.log('removeSubsets:nodes', nodes)
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
        // console.log('getChildren:node', node.get('path'))
        // return node.has('children') ? node.get('children').map(c => c).toArray() : []
        return node.children
    }

    // finds all of the element nodes in the array that match the test predicate,
    // as well as any of their children that match it
    function findAll(test, nodes) {
        // console.log('findAll:nodes', nodes)

        // console.log('input nodes', nodes)
        const matchedDescendentNodes = _.flatten(_.map(nodes, (c) => findAll(test, getChildren(c))))

        // console.log('matchedDescendentNodes', matchedDescendentNodes)
        const allMatchedNodes = _.filter(nodes, test).concat(matchedDescendentNodes)
        // console.log('allMatchedNodes', allMatchedNodes)
        return allMatchedNodes
    }


    const adapter =
        {
            // is the node a tag?
            isTag: (node) => {
                // console.log('isTag:node', node)
                return true
            },

            // does at least one of passed element nodes pass the test predicate?
            existsOne: (test, elems) => _.some(elems, test),

            // get the attribute value
            getAttributeValue: (elem, name) => elem.get('props')[name],

            // get the node's children
            getChildren,

            // get the name of the tag
            getName: (elem: Node) => {
                // console.log('getName:elem', elem.get('path'), elem.get('tagName'))
                // console.log('elem', elem)
                // return elem.get('tagName')
                return elem.tagName
            },

            // get the parent of the node
            getParent,

            /*
              get the siblings of the node. Note that unlike jQuery's `siblings` method,
              this is expected to include the current node as well
            */
            getSiblings: (node) => {
                return getChildren(getParent(node))
            },

            // get the text content of the node, and its children if it has any
            getText: (node) => '',

            // does the element have the named attribute?
            hasAttrib: (elem, name) => _.has(elem.get('props'), name),

            // takes an array of nodes, and removes any duplicates, as well as any nodes
            // whose ancestors are also in the array
            removeSubsets,

            // finds all of the element nodes in the array that match the test predicate,
            // as well as any of their children that match it
            findAll,

            // finds the first node in the array that matches the test predicate, or one
            // of its children
            findOne: (test, elems) => {
                console.log('findOne:elems', elems)
                return _.find(elems, test)
            },

            /*
              The adapter can also optionally include an equals method, if your DOM
              structure needs a custom equality test to compare two objects which refer
              to the same underlying node. If not provided, `css-select` will fall back to
              `a === b`.
            */
            equals: (a, b) => a === b
        }

    return adapter
}
