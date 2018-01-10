import * as _ from 'lodash'
import Node from '../../node'

import { createThreeBSP } from './utils/ThreeBSP'

function collectGeometries(node: Node, toCutSelectors: string, fromSelectors: string) {
    
    const geometriesToCut = node.$(toCutSelectors).find('craftml-geometry').get()
    let geometryNodesToCutFrom = node.$(fromSelectors).find('craftml-geometry').get()

    geometryNodesToCutFrom = _.differenceWith(
        geometryNodesToCutFrom, geometriesToCut,
        (a, b) => a.equals(b))

    geometryNodesToCutFrom = _.filter(geometryNodesToCutFrom, g => {

        return _.some(geometriesToCut, f => g.layout.intersectsBox(f.layout))

    })

    const [geometriesToCutViaBSP, geometriesToCutViaDeletion] = _.partition(geometriesToCut, g => {

        return _.some(geometryNodesToCutFrom, f => g.layout.intersectsBox(f.layout))

    })

    return {
        from: geometryNodesToCutFrom, 
        toCut: {
            bsp: geometriesToCutViaBSP, 
            delete: geometriesToCutViaDeletion
        }
    }
}

export default function cut(node: Node, args: string = '*', options: { selectors?: string } = {}) {

    node = node.normalizeMatrix()

    const toCutSelectors = args
    const fromSelectors = options.selectors || '*'

    const ret = collectGeometries(node, toCutSelectors, fromSelectors)

    const bsp1 = createThreeBSP(ret.from)
    const bsp2 = createThreeBSP(ret.toCut.bsp)
    
    const resultBsp = bsp1.subtract(bsp2)

    // console.log('bsp1', bsp1.tree.allPolygons())

    const newGeometry = resultBsp.toGeometry()

    // console.log('newGeom', newGeometry)

    const addGeometry = (n: Node) => n.addGeometryNode(newGeometry)

    const nodesToDelete = [...ret.toCut.bsp, ...ret.toCut.delete, ...ret.from]
    const deleteUpdaters = _.map(nodesToDelete, y => (x: Node) => x.deleteSubtree(y))

    const updater = _.flow([...deleteUpdaters, addGeometry])
    return updater(node)
}
