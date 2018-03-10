# CraftML

2.0 Beta

- written in TypeScript
- no dependency on csg.js
- no dependency on openjscad

## Roadmap

Remaining features to implement:
[ ] div
[ ] h1, h2, h3, h4, h5
[ ] text using different fonts
[ ] circle
[ ] triangle
[ ] flip
[ ] clip
[ ] fit
[ ] import from local file systems
[ ] mutating a model inside a <script> tag

New features:
TBD

## API

### commonjs

```javascript
var craftml = require('craftml')

// render <cube/> into a model object
craftml.render('<cube/>')
    .then(model => {
        // save the model as 'cube.stl'
        model.saveAs('cube.stl')
    })
```

### TypeScript

Render

```javascript
import * as craftml from 'craftml'

// render <cube/> into a model object
const model = await craftml.render('<cube/>')

// save the model as 'cube.stl'
model.saveAs('cube.stl')
```

Render with parameters

```javascript
import * as craftml from 'craftml'

// render a row of repeated cubes, providing s = 5 as a parameter
// to specify the number of repetitions

const params = {s: 5}
const model = await craftml.render('<row><cube repeat="{{s}}"/></row>', params)

// save the model as 'cube.stl'
model.saveAs('row-of-cube.stl')
```



