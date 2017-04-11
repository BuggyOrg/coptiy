/* global describe, it */
import * as Graph from '@buggyorg/graphtools'
import * as graphs from './graphs.js'
import * as api from '../src/main.js'
import chai from 'chai'

const expect = chai.expect

// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY
// TRIANGLE   = ◭ = eg. IFs


function expectRef (from, to, graph, at = 0) {
  const refs = Graph.get('refs-to', from, graph)
  expect(refs, 'Array refs-to should exist for ' + from).to.exist
  expect(refs.length > at, 'refs-to array is to small').to.be.true
  expect(Graph.node(refs[at], graph)).to.deep.equal(Graph.node(to, graph), 'Failed to find a ref')
}

function expectRefLength (to, length, graph) {
  const ref = Graph.get('refs-to', to, graph)
  expect(ref, 'Array refs-to should exist for ' + to).to.exist
  expect(ref).to.have.length.of(length)
}

function expectCopy (from, to, graph, at = 0) {
  const copies = Graph.get('copies-to', from, graph)
  expect(copies, 'Array copies-to should exist for ' + from).to.exist
  expect(copies.length > at, 'copies-to array is to small').to.be.true
  expect(Graph.node(copies[at], graph)).to.deep.equal(Graph.node(to, graph), 'Failed to find a ref')
}

function expectCopyLength (to, length, graph) {
  const copies = Graph.get('copies-to', to, graph)
  expect(copies, 'Array copies-to should exist for ' + to).to.exist
  expect(copies).to.have.length.of(length)
}

const expectEdge = function (from, to, graph) {
  expect(Graph.hasEdge({from: from, to: to}, graph), 'Expected an edge from ' + from + ' to ' + to).to.be.true
}

const expectNoEdge = function (from, to, graph) {
  expect(Graph.hasEdge({from: from, to: to}, graph), 'Expected NO edge from ' + from + ' to ' + to).to.be.false
}

describe('TODO', () => {
  describe('addRefs (old)', () => {
    /**
     *      🞅
     *   ref ref
     *  🞅      🞅
     *   ref ref
     *      🞅
     */
    it('can detect and add refs', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      expectRefLength('root', 2, graph)
      expectRefLength('left', 1, graph)
      expectRefLength('right', 1, graph)

      expectRef('left', 'merge', graph)
      expectRef('right', 'merge', graph)
      expectRef('root', 'left', graph, 0)
      expectRef('root', 'right', graph, 1)
    })

    /**  is the same as
     *   🞅           🞅
     *  copy         ref
     *   🞏           🞅
     *  copy         ref
     *   🞏           🞅
     *  copy         ref
     *   🞏           🞅
     *  ref          ref
     *   🞅           🞅
     */
    it('can detect chains', () => {
      var graph = graphs.chain5()

      graph = Graph.set({'copy-type': '🞅'}, 'c0', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'c1', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'c2', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'c3', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'c4', graph)

      graph = api.addRefs(graph)

      expectRefLength('c0', 1, graph)
      expectRefLength('c1', 1, graph)
      expectRefLength('c2', 1, graph)
      expectRefLength('c3', 1, graph)

      expectRef('c0', 'c1', graph)
      expectRef('c1', 'c2', graph)
      expectRef('c2', 'c3', graph)
      expectRef('c3', 'c4', graph)
    })

    /**
     *      🞅
     *  ref  copy   // only one copy is needed
     *  🞏      🞏
     *   ref ref
     *      🞅
     */
    it('can replace two copies to one ref', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      expectRefLength('left', 1, graph)
      expectRef('left', 'merge', graph)

      expectRefLength('right', 1, graph)
      expectRef('right', 'merge', graph)

      expectRefLength('root', 1, graph)
      expectRef('root', 'left', graph)
    })

    /**
     *      🞏
     *   ref copy
     *  🞅      🞏
     *   ref ref
     *      🞅
     */
    it('should create a simple copy', () => {
      var graph = graphs.simple4()
      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)
      graph = api.addRefs(graph)

      expectRefLength('left', 1, graph)
      expectRef('left', 'merge', graph)

      expectRefLength('right', 1, graph)
      expectRef('right', 'merge', graph)

      expectRefLength('root', 1, graph)
      expectRef('root', 'left', graph)

      expectCopyLength('root', 1, graph)
      expectCopy('root', 'right', graph)
    })

    /**
     *      🞅
     *   copy ref
     *  🞏      |
     *   ref   /
     *       🞅
     */
    it.skip('TODO', () => {
      var graph = graphs.simple3()
      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      console.log(Graph.node('root', graph))
    })

    /**
     *                🞅
     *          copy       ref    // left or right side first?
     *        🞏               🞅
     *     ref  copy
     *   🞏/🞅    🞏           ref
     *     ref  ref
     *        🞏               🞅
     *            ref?    ref
     *                🞅
     */
    it.skip('TODO', () => {

    })
  })

  describe('addNodes (new)', () => {
    /**
     *      🞅          root
     *   ref ref      /     \
     *  🞅      🞅  left    right
     *   ref ref      \     /
     *      🞅          merge
     */
    it('can detect and add refs with new node', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      expectEdge('root@out', 'left@in', graph)
      expectEdge('root@out', 'right@in', graph)

      expect(Graph.nodes(graph)).to.have.length(4)
      graph = api.addNodes(graph)

      expectNoEdge('root', 'left', graph)
      expectNoEdge('root', 'right', graph)
      expectNoEdge('root@out', 'left@in', graph)
      expectNoEdge('root@out', 'right@in', graph)

      expectEdge('root@out', '/DUPREF@in', graph)
      expectEdge('/DUPREF@out0', 'left@in', graph)
      expectEdge('/DUPREF@out1', 'right@in', graph)

      expect(Graph.node('root', graph)).exists
      expect(Graph.node('/DUPREF', graph)).exists
      expect(Graph.node('left', graph)).exists
      expect(Graph.node('right', graph)).exists
      expect(Graph.node('merge', graph)).exists
      expect(Graph.nodes(graph)).to.have.length(5)
    })

    /**
     *      🞅          root
     *   ref copy     /     \
     *  🞅      🞏  left    right
     *   ref ref      \     /
     *      🞅          merge
     */
    it('can add sequence edges', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      expectEdge('root@out', 'left@in', graph)
      expectEdge('root@out', 'right@in', graph)

      expect(Graph.nodes(graph)).to.have.length(4)
      graph = api.addNodes(graph)
      Graph.debug(graph)

      expectNoEdge('root', 'left', graph)
      expectNoEdge('root', 'right', graph)
      expectNoEdge('root@out', 'left@in', graph)
      expectNoEdge('root@out', 'right@in', graph)

      expect(Graph.node('root', graph)).exists
      expect(Graph.node('/DUPSEQ', graph)).exists
      expect(Graph.node('left', graph)).exists
      expect(Graph.node('right', graph)).exists
      expect(Graph.node('merge', graph)).exists
      expect(Graph.nodes(graph)).to.have.length(5)

      expectEdge('root@out', '/DUPSEQ@in', graph)
      expectEdge('/DUPSEQ@out0', 'left@in', graph)
      expectEdge('/DUPSEQ@out1', 'right@in', graph)
      console.log(JSON.stringify(Graph.toJSON(graph).edges, null, 1))
      expect(Graph.edges(graph)).to.have.length(6)
    })

    it.skip('Extra function test', () => {
      var o = api.executeForPairs(
        ['a', 'b'],
        [1, 2],
        (a, b, arr) => {
          console.log('pushing', a, ' and ', b, ' into ', arr)
          arr.push([a, b])
          return arr
        },
        [])
      expect(o).to.have.length(4)
      console.log(JSON.stringify(o, null, 0))
    })

    // TODO: update graphtools to allow layers
    it.skip('Add one sequence dummy edge', () => {
      var graph = graphs.simple4()
      var graphAfter = api.executeForPairs(
        [Graph.node('left', graph)],
        [Graph.node('right', graph)],
        (a, b, g) => Graph.addEdge({from: a.id, to: b.id, layer: 'sequence'}, g), graph)

      var edges = Graph.edges(graph)
      var edgesAfter = Graph.edges(graphAfter)

      expect(edges).to.have.length(4)
      expect(edgesAfter).to.have.length(edges.length + 1)

      let succ = Graph.successors('left', graph)
      let succAfter = Graph.successors('left', graphAfter, {layers: ['dataflow', 'sequence']})

      expect(succ).to.have.length(1)
      expect(succAfter).to.have.length(succ.length + 1)
      expect(succ.some(e => Graph.node(e, graph).id === Graph.node('right', graph).id)).to.be.false
      expect(succAfter.some(e => Graph.node(e, graph).id === Graph.node('right', graph).id)).to.be.true

      expect(Graph.successors(
        Graph.node('left', graph), graph, {layers: ['dataflow', 'sequence']}).some(
          b => Graph.node(b, graph) === Graph.node('right', graph))).to.be.false
      expect(Graph.successors(
        Graph.node('left', graphAfter), graphAfter, {layers: ['dataflow', 'sequence']}).some(
          b => Graph.node(b, graphAfter) === Graph.node('right', graphAfter))).to.be.true
    })
    /**
     * FROM:
     *        root
     *     /    |    \
     * left  middle  right
     *     \    |    /
     *        merge
     * TO:
     *        root
     *          |
     *        DUP
     *       /    \
     *     DUP      right
     *    /   \      |
     * left  middle  |
     *     \    |   /
     *        merge
     */
    it('can detect and add refs with one node with 3 successors', () => {
      var graph3 = Graph.flow(
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
            { port: 'in1', kind: 'input', type: 'generic' },
            { port: 'in2', kind: 'input', type: 'generic' }
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
          name: 'middle',
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
        Graph.addEdge({ from: 'root@out', to: 'middle@in' }),
        Graph.addEdge({ from: 'root@out', to: 'right@in' }),
        Graph.addEdge({ from: 'left@out', to: 'merge@in0' }),
        Graph.addEdge({ from: 'middle@out', to: 'merge@in1' }),
        Graph.addEdge({ from: 'right@out', to: 'merge@in2' })
      )()
      Graph.debug(graph3)
      expect(Graph.nodes(graph3)).to.have.length(5)
      var graph = api.addNodes(graph3)
      Graph.debug(graph)
      expectNoEdge('root', 'left', graph)
      expectNoEdge('root', 'right', graph)
      expectNoEdge('root@out', 'left@in', graph)
      expectNoEdge('root@out', 'right@in', graph)
      // first DUP
      expectEdge('root@out', '/DUP@in', graph)
      expectEdge('/DUP@out0', 'right@in', graph)
      expectEdge('/DUP@out1', '/DUP@in', graph)
      // second DUP
      expectEdge('/DUP@out0', 'left@in', graph)
      expectEdge('/DUP@out1', 'middle@in', graph)

      expectEdge('left@out', 'merge@in0', graph)
      expectEdge('middle@out', 'merge@in1', graph)
      expectEdge('right@out', 'merge@in2', graph)

      expect(Graph.node('root', graph)).exists
      expect(Graph.node('/DUP', graph)).exists
      expect(Graph.node('left', graph)).exists
      expect(Graph.node('right', graph)).exists
      expect(Graph.node('middle', graph)).exists
      expect(Graph.node('merge', graph)).exists
      expect(Graph.nodes(graph)).to.have.length(7) // 2x DUP
    })
  })
})
