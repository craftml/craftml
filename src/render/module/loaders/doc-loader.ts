import { DomNode } from '../../../dom'
import { DOM } from '../../../dom'
import { call } from 'redux-saga/effects'
import axios from 'axios'

import parse from '../../../parse'

function loadFromUrl(url: string): Promise<{ code?: string, error?: {}}> {
    
    return axios.get(url)
        .then((response) => {
            // console.log(response);
            return { code: response.data }
        })
        .catch(error => ({ error }))
}

const React = {}

const generateModuleFirebaseLink = (moduleId: string) => `https://craftml-io.firebaseio.com/modules/${moduleId}.json`

export default function* loadDoc(moduleId: string) { 

    const moduleFirebaseLink = generateModuleFirebaseLink(moduleId)
    // if (node)
    // console.log('part', name, node.domNode)

    // const data = yield call(loadFromUrl, moduleFirebaseLink)
    const data = { code: '<row><cube/><cube/><cube/></row>', error: null}

    const { code, error } = data
    if (error) {
        console.error('error', error)
        // yield put(nodux.PushError(error))
        return []
    } else if (code === null) {
        const ERROR_MESSAGE = `unable to load module ${moduleId}`
        // yield put(nodux.Mount(moduleName, component.props))
        // yield put(nodux.PushError(new Error(ERROR_MESSAGE)))
        return []
    }

    // console.log('code', code)

    const parsed = parse(code)

    return parsed

}
