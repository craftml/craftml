import { render, commit, refresh } from '../effects'
import { call } from 'redux-saga/effects'
import * as t from 'io-ts'
import createRenderer from '../createRenderer'
import * as _ from 'lodash'
import { React, DomNode, DOM } from '../../dom'
import { Map } from 'immutable'
// isStl = 'moduleId'

import loadDoc from './loaders/doc-loader'

import { Part } from '../part'

import evalParams from './params'

const isStl = (moduleId: string): boolean => !_.isNull(moduleId.match(/\.stl$/))

export default createRenderer({
    tagName: 'craftml-module',
    defaultProps: {     
        module: '',
        name: '',    // TODO: must be required
        t: '',
        repeat: ''
    },
    propTypes: t.interface({
        module: t.string,
        name: t.string,
        t: t.string,
        repeat: t.string
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        let part = node.getPart(props.name)        

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

        } else if (part.type === 'local') {
          
            // TODO: handle merge more gracefully
            let partProps = part.props
            // why??
            // coerce merge='' to merge=true
            // if (_.has(part.body.attribs,'merge')) {
            //     // $FlowFixMe
            //     partProps.merge = true
            // }
        
            instanceDef = {
                displayTagName: `craftml-module@local`,
                children: part.body.children,
                props,
                partProps
            }                          

        }

        if (instanceDef) {

            // <part name="foo" merge> -> instanceDef.partProps.merge
            // <foo merge> -> props.merge
            const merge = instanceDef.partProps.merge || props.merge
                
            // render a new top node (without html props)
            const top = DOM(<craftml-group tagName={instanceDef.displayTagName} merge={true}/>)
            yield render(node, top)

            node = yield refresh(node)
            
            const clientGivenProps = domNode.attribs    

            const params = evalParams(node, clientGivenProps, instanceDef.children)

            const contextMap = Map(params)

            node = node.setContext(contextMap)

            node = node.setBlock({children: domNode.children, context: contextMap})
                        
            yield commit(node)            
        
            let wrapped = DOM(
                <g {...instanceDef.props} merge={merge} tagName={clientGivenTagName}>
                    <g {...instanceDef.partProps} merge={true}>
                        {instanceDef.children}
                    </g>
                </g>)
        
            yield render(node.child(0), wrapped)
        }
        // yield commit(node)

    }
})