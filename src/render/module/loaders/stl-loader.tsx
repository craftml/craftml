import { DOM, React } from '../../../dom'
import * as THREE from 'three'
import { call } from 'redux-saga/effects'
import axios from 'axios'
const STLLoader = require('three-stl-loader')(THREE)
const loader = new STLLoader()

function download_from(fullURL: string): Promise<ArrayBuffer> {
  // console.log('download from ', fullURL)
  return axios
    .get(fullURL, {responseType: 'arraybuffer'})
    .then(response => {
      // console.log('response', response)
      return response.data
    })
}

export default function* loadStl(moduleId: string) {

  const url = moduleId

  let data = yield call(download_from, url)
  // console.log('data', typeof data, data)
  // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
  // in Node.js data is Buffer
  // in browser, data is ArrayBuffer
  let arraybuffer = data.buffer ? data.buffer : data

  const geometry = loader.parse(arraybuffer)

  return [DOM(<craftml-geometry geometry={geometry} dimensions={3}/>)]

}
