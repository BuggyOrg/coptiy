/* global describe, it */
import * as Graph from '@buggyorg/graphtools'
import * as graphs from './graphs'
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

describe('TODO', () => {
  describe('TODO', () => {
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
     *  copy copy   // only one copy is needed
     *  🞏      🞏
     *   ref ref
     *      🞅
     */
    it.skip('can replace two copies to one ref', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      expectRefLength('root', 1, graph)
      expectRefLength('left', 1, graph)
      expectRefLength('right', 1, graph)
    })

    /**
     *      🞅             🞏
     *   ref copy       ref copy
     *  🞏      🞏      🞅      🞏
     *   ref ref        ref ref
     *      🞅             🞅
     */
    it.skip('should be the same', () => {
      var graph = graphs.simple4()
      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)
      graph = api.addRefs(graph)

      var graph2 = graphs.simple4()
      graph2 = Graph.set({'copy-type': '🞅'}, 'root', graph2)
      graph2 = Graph.set({'copy-type': '🞏'}, 'left', graph2)
      graph2 = Graph.set({'copy-type': '🞅'}, 'right', graph2)
      graph2 = Graph.set({'copy-type': '🞅'}, 'merge', graph2)
      graph2 = api.addRefs(graph2)


      console.log(Graph.node('root', graph))
      console.log(Graph.node('root', graph2))
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
    it('TODO', () => {

    })
  })
})
