import * as craftml from './api'

describe('api', async () => {

  it('render', async () => {

    const model = await craftml.render('<cube/>')
    model.pp()

  })

  it('render with params', async () => {

    await craftml.render('<cube/>')

})

})
