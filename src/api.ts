import Engine from './engine'
const engine = new Engine()

export function render(code: string, params?: object) {
    return engine.render(code)
}