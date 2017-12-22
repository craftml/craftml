import Node from './node'

export const COMMIT = 'COMMIT';
export const UPDATE = 'UPDATE';

export type Actions = {
    COMMIT: {
      type: typeof COMMIT,
      payload: {
          node: Node
      }
    },
    UPDATE: {
        type: typeof UPDATE,
        payload: {
            node: Node,
            updateFunc: (a: Node) => Node
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
    update: (node: Node, updateFunc: (a: Node) => Node): Actions[typeof UPDATE] => ({
        type: UPDATE,
        payload: {
            node,
            updateFunc
        }
    })    
};