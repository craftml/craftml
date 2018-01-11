import { renderAsync } from './engine'
import parse from './parse'

async function foo() {
    const code = '<cube/>'
    const dom = parse(code)
    const node = await renderAsync(dom[0])
    node.pp()
}

foo()