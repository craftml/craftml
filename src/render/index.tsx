import { DomNode, DOM, React } from '../dom'
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
import cone from './primitives/cone'
import sphere from './primitives/sphere'
import prism from './primitives/prism'
import circle from './primitives/circle'
import rectangle from './primitives/rectangle'
import polygon from './primitives/polygon'
import path from './primitives/path'

import style from './css/style'

import row from './structure/row'
import col from './structure/col'
import stack from './structure/stack'
import g from './structure/g'

import repeat from './logic/repeat'

import moduleRenderer from './module'
import part from './part'

import { commit, refresh } from './effects'

import { Renderer } from './createRenderer'

function createRenderersMap(): Map<string, Renderer<{}>> {
    const rs: Map<string, Renderer<{}>> = new Map()
    rs.set('script', script)
    rs.set('cube', cube)
    rs.set('cylinder', cylinder)
    rs.set('cone', cone)
    rs.set('sphere', sphere)
    rs.set('prism', prism)
    rs.set('circle', circle)
    rs.set('rectangle', rectangle)
    rs.set('polygon', polygon)
    rs.set('path', path)

    rs.set('row', row)
    rs.set('col', col)
    rs.set('stack', stack)
    rs.set('g', g)

    rs.set('style', style)

    rs.set('part', part)

    rs.set('test', test)        

    rs.set('craftml-group', group)
    rs.set('craftml-unit', unit)
    rs.set('craftml-geometry', geometry)
    rs.set('craftml-transform', transform)
    rs.set('craftml-layout', layout)
    rs.set('craftml-repeat', repeat)
    rs.set('craftml-module', moduleRenderer)

    return rs
}

const RENDERERS = createRenderersMap()

export default function* renderMain(node: Node, domNode: DomNode): {} {

    const tagName = domNode.name
    const props = domNode.attribs

    node = node.setTagName(tagName)
        .setProps(props)

    yield commit(node)

    // get a new snapshot
    node = yield refresh(node)

    // strip empty children    
    const isNonEmpty = (c: DomNode) => !(c.type === 'text' && (c.data || '').trim().length === 0)
    domNode.children = domNode.children.filter(isNonEmpty)
    
    const renderer = RENDERERS.get(tagName)
    if (renderer) {        

        yield renderer(node, props, domNode)

    }  else {

        // attempt to load the renderer as a module        
        const wrapped = DOM(
            <craftml-module name={tagName} {...domNode.attribs}>
              {domNode.children}
            </craftml-module>)

        yield renderMain(node, wrapped)

    }
    
}