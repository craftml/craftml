// import { Packet } from "_debugger";
import Node from './node'

export const COMMIT = 'COMMIT';
// export const DECREMENT_SFC = 'DECREMENT_SFC';

export type Actions = {
    COMMIT: {
      type: typeof COMMIT,
      payload: {
          node: Node
      }
    },  
  }
  
export const actionCreators = {
    commit: (node: Node): Actions[typeof COMMIT] => ({
        type: COMMIT,
        payload: {
            node
        }
    }),    
};