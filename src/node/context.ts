import { Map, Record, List } from 'immutable'
import { Part } from '../render/part'
import { DomNode } from '../dom'
import * as css from '../render/css'

const NodeContextRecord = Record({
    parts: Map<string, Part>(),
    // tslint:disable-next-line:no-any
    params: Map<string, any>(),
    styleSheets: List<css.StyleSheet>(),
    block: {
        children: [] as DomNode[],
        // tslint:disable-next-line:no-any
        context: Map<string, any>()
    }    
})

// tslint:disable-next-line:no-any
type Context = Map<string, any>
interface ContentBlock {
    children: DomNode[],
    context: Context
}

export default class NodeContext extends NodeContextRecord {

    // tslint:disable-next-line:no-any
    setParams(obj: Map<string, any>) {        
        return this.set('params', obj)
    }
    
    setParts(parts: Map<string, Part>) {        
        return this.set('parts', parts)
    }

    addPart(name: string, part: Part) {
        return this.update('parts', parts => parts.set(name, part))
    }

    getPart(name: string): Part | null {
        if (this.parts.has(name)) {
            return this.parts.get(name, null)
        } else {
            return null
        }
    }

    setBlock(block: ContentBlock) {        
        return this.set('block', block)
    }

    addStyleSheet(stylesheet: css.StyleSheet) {        
        return this.update('styleSheets', ss => ss.push(stylesheet))
    }

    setStyleSheets(styleSheets: List<css.StyleSheet>) {
        return this.set('styleSheets', styleSheets)        
    }
    
}