// /** @flow */
// import type { RenderSaga } from '../saga'
// import makeRenderSagaCreator from './makeRenderSagaCreator'
// import { call, put, take, select, fork, cancel, cancelled } from 'redux-saga/effects'
// import _ from 'lodash'
// import render from './'
// import DOM from '../dom'
// import type Node from '../node'
// import type { DomNode } from '../dom'

// function* part(nodux, props, children) {

//   let node : Node = yield select(nodux.getNode())
//   const { name, module } = props
//   //
//   // console.log('module', module)

//   // TODO: check for the correct module id format
//   let part
//   if (module.length > 0) {

//     part = {
//       type: 'import',
//       props,
//       body: module
//     }

//   } else {

//     part = {
//       type: 'local',
//       props,
//       body: node.domNode
//     }

//   }


//   const parentNodux = nodux.parent()
//   if (parentNodux){

//     let parentNode : Node = yield select(parentNodux.getNode())

//     parentNode = parentNode.addPart(name, part)

//     yield put(parentNodux.Set(parentNode.state))
//   }

// }

// export default makeRenderSagaCreator({
//   tagName: 'part',
//   body: part,
//   defaultProps: {
//     name: '',
//     module: ''
//   }
// })

// import { Geometry } from 'three';
import { commit, update, parentOf } from './effects'
import { DomNode } from '../dom'
import * as t from 'io-ts'
import createRenderer from './createRenderer'

// export interface Part {
//     type: 'import' | 'local',
//     props: {}
//     body: string | DomNode
// }

export interface ImportPart {
    type: 'import',
    props: {},
    body: string
}

export interface LocalPart {
    type: 'local',
    props: {},
    body: DomNode
}

export type Part = ImportPart | LocalPart

export default createRenderer({
    tagName: 'part',
    defaultProps: {
        name: '',
        module: '',
        t: '',
        repeat: '',
        merge: false
    },
    propTypes: t.interface({
        name: t.string,
        module: t.string,
        t: t.string,
        repeat: t.string,
        merge: t.boolean
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {

        // const { geometry, dimensions } = props 

        const { name, module } = props

        let part: Part

        if (module.length > 0) {

            part = {
                type: 'import',
                props,
                body: module
            }

        } else {

            part = {
                type: 'local',
                props,
                body: domNode
            }

        }

        const parent = yield parentOf(node)

        if (parent) {
            
            yield update(parent, x => x.addPart(name, part))

        }

        // node = node.setGeometry(geometry as Geometry).setDimensions(dimensions)

        // yield commit(node)

    }
})
