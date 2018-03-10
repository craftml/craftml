# CraftML

## API

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



## Notes

https://stackoverflow.com/questions/34622598/typescript-importing-from-libraries-written-in-es5-vs-es6
