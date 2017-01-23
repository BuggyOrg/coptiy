/* global describe, it */
import * as Graph from '@buggyorg/graphtools'
import * as graphs from './graphs'
import * as api from '../src/main.js'
import chai from 'chai'

const expect = chai.expect

// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY
// TRIANGLE   = ◭ = eg. IFs

describe('TODO', () => {
  describe('TODO', () => {
    /**
     *      🞅
     *   ref ref
     *  🞅      🞅
     *   ref ref
     *      🞅
     */
    it.only('can detect and add refs', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      graph = api.addRefs(graph)

      expect(Graph.get('refs-to', 'root', graph)).to.have.length.of(2)
      expect(Graph.get('refs-to', 'left', graph)).to.have.length.of(1)
      expect(Graph.get('refs-to', 'right', graph)).to.have.length.of(1)
    })

    it('TODO', () => {
      var graph = graphs.simple4()

      graph = Graph.set({'copy-type': '🞅'}, 'root', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'left', graph)
      graph = Graph.set({'copy-type': '🞏'}, 'right', graph)
      graph = Graph.set({'copy-type': '🞅'}, 'merge', graph)

      console.log(Graph.get('copy-as', 'root', graph))

      graph = api.addRefs(graph)

      console.log(Graph.node('root', graph))
    })

    /**
     *      🞅             🞏
     *   ref copy       ref copy
     *  🞏      🞏      🞅      🞏
     *   ref ref        ref ref
     *      🞅             🞅
     */
    it('TODO', () => {
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
  })
})
