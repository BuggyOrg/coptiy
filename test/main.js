/* global describe, it */
import * as Graph from '@buggyorg/graphtools'
import * as graphs from './graphs_e'
import * as api from '../src/main.js'
import chai from 'chai'
import * as _ from 'lodash'

const expect = chai.expect

// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY
// TRIANGLE   = ◭ = eg. IFs

/**
 * expection helper beginning
 */

function expectPort (from, to, graph, name) {
  const node = Graph.node(from, graph)
  const toNode = Graph.node(to, graph)
  var found = node.ports.filter((p) => {
    const ref = p[name]
    if (ref) {
      return ref.some((pp) => {
        return _.isEqual(Graph.node(pp, graph), toNode)
      })
    }
    return false
  })
  // NOTE: found.length == 1 or better >= 1?
  expect(found, 'Failed to find a ' + name).to.have.length.of(1)
}

function expectPortLength (to, length, graph, name) {
  const node = Graph.node(to, graph)

  var found = node.ports.filter((p) => {
    const ref = p[name]
    if (ref && ref.length === length) {
      return true
    }
    return false
  })
  // NOTE: found.length == 1 or better >= 1?
  expect(found, 'Array ' + name + ' should exist inside one port').to.have.length.of(1)
}

function expectPortRef (from, to, graph) {
  return expectPort(from, to, graph, 'refs-to')
}

function expectPortRefsLength (to, length, graph) {
  expectPortLength(to, length, graph, 'refs-to')
}

function expectPortCopy (from, to, graph) {
  return expectPort(from, to, graph, 'copies-to')
}

function expectPortCopiesLength (to, length, graph) {
  expectPortLength(to, length, graph, 'copies-to')
}

/**
 * expection helper end
 */

describe('coptiy', () => {
  describe('graph tests', () => {
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

      expectPortRefsLength('root', 2, graph)
      expectPortRefsLength('left', 1, graph)
      expectPortRefsLength('right', 1, graph)

      expectPortRef('left', 'merge', graph)
      expectPortRef('right', 'merge', graph)
      expectPortRef('root', 'left', graph)
      expectPortRef('root', 'right', graph)
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

      expectPortRefsLength('c0', 1, graph)
      expectPortRefsLength('c1', 1, graph)
      expectPortRefsLength('c2', 1, graph)
      expectPortRefsLength('c3', 1, graph)

      expectPortRef('c0', 'c1', graph)
      expectPortRef('c1', 'c2', graph)
      expectPortRef('c2', 'c3', graph)
      expectPortRef('c3', 'c4', graph)
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

      expectPortRefsLength('left', 1, graph)
      expectPortRef('left', 'merge', graph)

      expectPortRefsLength('right', 1, graph)
      expectPortRef('right', 'merge', graph)

      expectPortRefsLength('root', 1, graph)
      expectPortRef('root', 'left', graph)
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

      expectPortRefsLength('left', 1, graph)
      expectPortRef('left', 'merge', graph)

      expectPortRefsLength('right', 1, graph)
      expectPortRef('right', 'merge', graph)

      expectPortRefsLength('root', 1, graph)
      expectPortRef('root', 'left', graph)

      expectPortCopiesLength('root', 1, graph)
      expectPortCopy('root', 'right', graph)
    })

    /**
     *      🞅
     *   copy ref
     *  🞏      |
     *   ref   /
     *       🞅
     */
    it('should work with one long edge and one extra node', () => {
      var graph = graphs.simple3()
      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      expect(Graph.node('root', graph).ports).to.have.length(1) // one out
      expect(Graph.node('left', graph).ports).to.have.length(2) // one in and one out
      expect(Graph.node('merge', graph).ports).to.have.length(1) // one in

      expectPortRefsLength('root', 1, graph)
      expectPortCopiesLength('root', 1, graph)
      expectPortRefsLength('left', 1, graph)

      expectPortRef('left', 'merge', graph)
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
})
