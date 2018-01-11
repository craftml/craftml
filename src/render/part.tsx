import { update, parentOf } from './effects'
import { DomNode } from '../dom'
import * as t from 'io-ts'
import createRenderer from './createRenderer'

export interface ImportPart {
    type: 'import',
    props: {
        merge?: boolean
    },
    body: string
}

export interface LocalPart {
    type: 'local',
    props: {
        merge?: boolean
    },
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

    }
})
