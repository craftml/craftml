import { React, DOM } from '../dom'
import * as _ from 'lodash'
import { BoxGeometry, Matrix4 } from 'three'
import { render } from './effects'
import * as t from 'io-ts'
import createRenderer from './createRenderer'

export default createRenderer({
    tagName: 'craftml-unit',
    defaultProps: {
        size: '10 10 10',
    },
    propTypes: t.interface({
        size: t.string        
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        const { size = '10 10 10' } = props
        const [ x, y, z ] = _.map(size.split(' '), Number)
    
        const geometry = new BoxGeometry(x, y, z)
        const matrix = new Matrix4().makeTranslation(x / 2, y / 2, z / 2)
        geometry.applyMatrix(matrix)
    
        // const d = DOM(
        //     <craftml-group tagName="craftml-unit" merge={false} {...props}>
        //         <craftml-geometry geometry={geometry} dimensions={3}/>
        //     </craftml-group>
        // )
    
        const d = DOM(<craftml-geometry geometry={geometry} dimensions={3}/>)
            
        yield render(node.child(0), d)        

    }
})