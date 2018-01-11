import { Map, Record } from 'immutable'

import { Part } from '../render/part'

const MyHashRecord = Record({
    parts: Map<string, Part>(),
    params: Map<string, any>()
})

type S = {
    parts: Map<string, Part>,
    // tslint:disable-next-line:no-any
    params: Map<string, any>
}

export default class NodeContext extends MyHashRecord {

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
}

// const c = new NodeContext()
// c.params
// c.pa
// c.set
// c.update('parts', 3)
// c.
// c.p
// c.p
// c.get('parts', 3)
// c.parts