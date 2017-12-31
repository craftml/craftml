import * as assert from 'assert'
// import type { NodeState } from './nodux'
import { Query } from './index'
import * as _ from 'lodash'

function closeTo(a: number, b: number) {
  return Math.abs(a - b) < 0.0001
}

class ChainableMethod {

  q: Query

  constructor(q: Query) {
    this.q = q
  }

  get have() {
    return this
  }

  get and() {
    return this
  }

  position(x: number, y: number, z: number) {
    
    _.forEach(this.q.get(), node => {
      const layout = node.layout
      const s = layout.position
      const msg = `expected position to be (${x},${y},${z}) but got (${s.x}, ${s.y}, ${s.z})`
      const check = closeTo(s.x, x) && closeTo(s.y, y) && closeTo(s.z, z)
      assert(check, msg)
    })

    return this
  }

  size(x: number, y: number, z: number) {
    
    _.forEach(this.q.get(), node => {
      const layout = node.layout
      const s = layout.size
      const msg = `expected size to be (${x},${y},${z}) but got (${s.x}, ${s.y}, ${s.z})`
      const check = closeTo(s.x, x) && closeTo(s.y, y) && closeTo(s.z, z)
      assert(check, msg)
    })

    return this
  }

  center(x: number, y: number, z: number) {

    _.forEach(this.q.get(), node => {
      const layout = node.layout
      const s = layout.center || {}
      const msg = `expected center to be (${x},${y},${z}) but got (${s.x}, ${s.y}, ${s.z})`
      const check = closeTo(s.x, x) && closeTo(s.y, y) && closeTo(s.z, z)
      assert(check, msg)
    })
    
    return this
  }

  style(name: string, value: string) {
    _.forEach(this.q.get(), node => {
      const style = node.style
      const v: string = style[name]
      const msg = `expected style.${name} to be ${value} but got ${v}`
      const check = value === v
      assert(check, msg)
    })
    return this
  }

  length(n: number) {
    const s = this.q.size()
    const msg = `expected ${n} but got ${s}`
    assert.equal(this.q.size(), n, msg)
    return this
  }  

  get none() {
    this.length(0)
    return this
  }

  get one() {
    this.length(1)
    return this
  }

  get two() {
    this.length(2)
    return this
  }

  get three() {
    this.length(3)
    return this
  }

  get four() {
    this.length(4)
    return this
  }

  get five() {
    this.length(5)
    return this
  }
}

export const should = (q: Query): ChainableMethod => new ChainableMethod(q)
