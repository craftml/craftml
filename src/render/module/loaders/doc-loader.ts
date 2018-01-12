import axios from 'axios'
import parse from '../../../parse'
import { call, CallEffect } from 'redux-saga/effects'
import { DomNode } from '../../../dom'
export { DomNode, CallEffect }

function loadFromUrl(url: string): Promise<{ code?: string, error?: {}}> {
    
    return axios.get(url)
        .then((response) => {
            // console.log(response);
            return { code: response.data }
        })
        .catch(error => ({ error }))
}

const generateModuleFirebaseLink = (moduleId: string) => `https://craftml-io.firebaseio.com/modules/${moduleId}.json`

export default function* loadDoc(moduleId: string) { 

    const moduleFirebaseLink = generateModuleFirebaseLink(moduleId)
    
    const data = yield call(loadFromUrl, moduleFirebaseLink)
    
    const { code, error } = data
    if (error) {
        
        // console.error('error', error)
        // yield put(nodux.PushError(error))
        return []

    } else if (code === null) {
        
        const ERROR_MESSAGE = `unable to load module ${moduleId}`
        // yield put(nodux.Mount(moduleName, component.props))
        // yield put(nodux.PushError(new Error(ERROR_MESSAGE)))
        // node.upd
        return []

    }

    // console.log('code', code)

    const parsed = parse(code)

    return parsed

}
