var craftml = require('..')
craftml.render('<cube/>')
    .then(c=>{
        c.pp()       
    })