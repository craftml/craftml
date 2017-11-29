///<reference path="test.d.ts"/>

var htmlparser = require('htmlparser2')
var DomHandler = require('./domhandler')
// import * as htmlparser from 'htmlparser2'
// import urljoin from 'url-join'
// import DomHandler from './domhandler'
import { DomNode } from './dom'

// export function parse1(code, context) {
//
//     return new Promise((resolve, reject) => {
//
//       let handler = new DomHandler(
//           (error, dom) => {
//             // console.log('error', error)
//             if (error){
//               const syntaxError = new SyntaxError(error.message)
//               syntaxError.element = error.element
//               reject(syntaxError)
//             } else {
//               resolve(dom)
//             }
//           }, {
//               // get the start index so we can report a better error message
//               // referring to a line
//               withStartIndices: true
//           })
//
//       let parser = new htmlparser.Parser(handler, {
//             recognizeSelfClosing: true,
//             lowerCaseAttributeNames: false
//           })
//       parser.write(code)
//       parser.end()
//     })
// }

export default function parse(code: string, context?: {}): DomNode[] {

    // return new Promise((resolve, reject) => {

    let handler = new DomHandler(
        (error, dom) => {
          // console.log('error', error)
          if (error){
            const syntaxError = new SyntaxError(error.message)
            // $FlowFixMe
            syntaxError.element = error.element
            // reject(syntaxError)
          } else {
            // resolve(dom)
          }
        }, 
        {
            // get the start index so we can report a better error message
            // referring to a line
            withStartIndices: true
        })

        // htmlparser.

    let parser = new htmlparser.Parser(handler, {
          recognizeSelfClosing: true,
          lowerCaseAttributeNames: false          
        })
    parser.write(code)
    parser.end()
    return handler.dom
    // })
}
