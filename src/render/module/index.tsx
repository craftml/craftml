import { render } from '../effects'
import { call } from 'redux-saga/effects'
import * as t from 'io-ts'
import createRenderer from '../createRenderer'
import * as _ from 'lodash'
import { React, DomNode, DOM } from '../../dom'
// isStl = 'moduleId'

import loadDoc from './loaders/doc-loader'

import { Part } from '../part'

const isStl = (moduleId: string): boolean => !_.isNull(moduleId.match(/\.stl$/))

export default createRenderer({
    tagName: 'craftml-module',
    defaultProps: {     
        module: ''   
    },
    propTypes: t.interface({
        module: t.string
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        let part = node.getPart(props.name)

        console.log('part', part)

        if (!part) {

            // handles inline part definition
            // <stuff module="bbbb">
            // -->
            // <craftml-module name="stuff" module="bbbb" {...props}/>
            if (props.module) {
        
                part = {
                    type: 'import',
                    props: {},
                    body: props.module,
                }
        
            } else {
        
                return
        
            }
                
        }

        const clientGivenTagName = props.name
        // console.log('clientGivenTagName', clientGivenTagName)

        const moduleId = props.module

        let instanceDef: {
            displayTagName: string,
            children: DomNode[],
            props: {},
            partProps: {}
        } | null = null

        if (part.type === 'import') {

            if (isStl(moduleId)) {

                // let children = yield call(load_stl, moduleId)
          
                // instanceDef = {
                //   displayTagName: `craftml-module@${moduleId}`,
                //   children,
                //   props,
                //   partProps: part.props,
                // }
          
              } else {
          
                const children = yield call(loadDoc, moduleId)
          
                instanceDef = {
                  displayTagName: `craftml-module@${moduleId}`,
                  children,
                  props,
                  partProps: part.props,
                }
            }

        }

        if (instanceDef) {
            // console.log('TODO: module', instanceDef)
            
            // render a new top node (without html props)
            const top = DOM(<craftml-group tagName={instanceDef.displayTagName} merge={true}/>)
            yield render(node, top)
          
            // node = yield select(nodux.getNode())
            // node = evalParams(node, props, instanceDef.children)
            // node = node.setBlock(children)
            // yield put(nodux.Set(node.state))
        
            let wrapped = DOM(
                <g {...instanceDef.props} merge={true} tagName={clientGivenTagName}>
                    <g {...instanceDef.partProps} merge={true}>
                        {instanceDef.children}
                    </g>
                </g>)
        
            yield render(node.child(0), wrapped)
        }
        // yield commit(node)

    }
})