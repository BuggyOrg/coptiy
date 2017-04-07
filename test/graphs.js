import * as Graph from '@buggyorg/graphtools'

export function simple3 () {
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
        { port: 'in0', kind: 'input', type: 'generic' },
        { port: 'in1', kind: 'input', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'left',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addEdge({ from: 'root@out', to: 'left@in' }),
    Graph.addEdge({ from: 'root@out', to: 'merge@in0' }),
    Graph.addEdge({ from: 'left@out', to: 'merge@in1' })
  )()
}

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
        { port: 'in0', kind: 'input', type: 'generic' },
        { port: 'in1', kind: 'input', type: 'generic' }
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
    Graph.addEdge({ from: 'left@out', to: 'merge@in0' }),
    Graph.addEdge({ from: 'right@out', to: 'merge@in1' }),
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

export function chain5 () {
  return Graph.flow(
    Graph.addNode({
      name: 'c0',
      ports: [
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'c1',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'c2',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'c3',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' },
        { port: 'out', kind: 'output', type: 'generic' }
      ]
    }),
    Graph.addNode({
      name: 'c4',
      ports: [
        { port: 'in', kind: 'input', type: 'generic' }
      ]
    }),
    Graph.addEdge({ from: 'c0@out', to: 'c1@in' }),
    Graph.addEdge({ from: 'c1@out', to: 'c2@in' }),
    Graph.addEdge({ from: 'c2@out', to: 'c3@in' }),
    Graph.addEdge({ from: 'c3@out', to: 'c4@in' })
  )()
}
