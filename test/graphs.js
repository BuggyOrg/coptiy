import * as Graph from '@buggyorg/graphtools'

export function simple4 () {
  return Graph.flow(
    Graph.addNode({
      name: 'root',
      ports: [
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'merge',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'left',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'right',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addEdge({ from: 'root@out', to: 'left@in' }),
    Graph.addEdge({ from: 'root@out', to: 'right@in' }),
    Graph.addEdge({ from: 'left@out', to: 'merge@in' }),
    Graph.addEdge({ from: 'right@out', to: 'merge@in' }),
  )()
}

export function simple6 () {
  return Graph.flow(
    Graph.addNode({
      name: 'root',
      ports: [
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'merge',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'left',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'left2',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'right',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'right2',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addEdge({ from: 'root@out', to: 'left@in' }),
    Graph.addEdge({ from: 'root@out', to: 'right@in' }),
    Graph.addEdge({ from: 'left@out', to: 'left2@in' }),
    Graph.addEdge({ from: 'right@out', to: 'right2@in' }),
    Graph.addEdge({ from: 'left2@out', to: 'merge@in' }),
    Graph.addEdge({ from: 'right2@out', to: 'merge@in' }),
  )()
}
