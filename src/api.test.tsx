import * as craftml from './api'

// tslint:disable:no-unused-expression
describe('api', async () => {

    describe('render', async () => {

        it('simple cube', async () => {

            const model = await craftml.render('<cube/>')
            model.should.have.size(10, 10, 10)
        })
    
        it('params repeat', async () => {
    
            const params = { s: 5 }
            const model = await craftml.render('<row><cube repeat="{{5}}"/></row>', params)
                        
            model.$('cube').should.have.five            
        })
    
        it('params t', async () => {
    
            const params = { s: 2 }
            const model = await craftml.render('<cube t="scale {{s}}"/>', params)

            model.should.have.size(20, 20, 20)
        })

    })

})
