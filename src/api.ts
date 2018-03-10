import Engine from './engine'
const engine = new Engine()
import Node from './node'

export function render(code: string, params?: object) {
    return engine.render(code, params)
}