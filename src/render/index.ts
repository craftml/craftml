import { DomNode } from '../dom'
import Node from '../node'

import unit from './unit'
import test from './_test'
import script from './script'
import geometry from './geometry'
import group from './group'
import transform from './transform'
import layout from './layout'

import cube from './primitives/cube'
import cylinder from './primitives/cylinder'

import { commit } from './effects'

import { Renderer } from './createRenderer'

function createRenderersMap(): Map<string, Renderer<{}>> {
    const rs: Map<string, Renderer<{}>> = new Map()
    rs.set('script', script)
    rs.set('cube', cube)
    rs.set('cylinder', cylinder)
    rs.set('test', test)    
    rs.set('craftml-group', group)
    rs.set('craftml-unit', unit)
    rs.set('craftml-geometry', geometry)
    rs.set('craftml-transform', transform)
    rs.set('craftml-layout', layout)
    return rs
}

const RENDERERS = createRenderersMap()

export default function* renderMain(node: Node, domNode: DomNode): {} {

    const tagName = domNode.name
    const props = domNode.attribs

    node = node.setTagName(tagName)
        .setProps(props)

    yield commit(node)

    const renderer = RENDERERS.get(tagName)
    if (renderer) {

        yield renderer(node, props, domNode)

    } 
    
}