import * as Graph from '@buggyorg/graphtools'
import * as Rewrite from '@buggyorg/rewrite'
import * as _ from 'lodash'

// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY
// TRIANGLE   = ◭ = eg. IFs

/** Only cirlce sucessors
 *     🞅
 *  ref  ref
 *  🞅     🞅
 */
let ruleThreeCircles = Rewrite.applyPort(
  (node, port, graph) => {
    var type = Graph.get('copy-type', port, graph)
    if (Graph.get('copy-as', port, graph) || port['copy-as']) {
      return false
    }
    if (type === '🞅') {
      if (Graph.successors(port, graph).every((sn) => Graph.get('copy-type', sn, graph) === '🞅')) {
        return port
      }
    }
    return false
  },
  (port, graph) => {
    var node = Graph.node(port, graph)
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref'
    })
    graph = Rewrite.replacePort(node, port, newPort, graph)
    return Graph.set({'refs-to': Graph.successors(port, graph)}, port, graph)
  }
)

/** Chains with only one child/sucessor
 *  🞅
 * ref
 *  🞏
 * ref
 *  🞏
 */
let ruleChain = Rewrite.applyPort(
  (node, port, graph) => {
    var sucessors = Graph.successors(port, graph)
    if (sucessors.lenght === 1) {
      return port
    }
    return false
  },
  (port, graph) => {
    var node = Graph.node(port, graph)
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref'
    })
    graph = Rewrite.replacePort(node, port, newPort, graph)
    return Graph.set({'refs-to': Graph.successors(port, graph)}, port, graph)
  }
)

/**
 *     🞅
 *  ref  copy
 *  🞅     🞏
 *
 *  == or ==
 *
 *     🞅
 *  copy ref
 *  🞏     🞅
 *
 *  == or ==
 *
 *     🞅
 *  ref  copy
 *  🞏     🞏
 *
 *     🞅
 *  copy ref
 *  🞏     🞏
 */
// TODO

export function addRefs (graph) {
  return Rewrite.rewrite([ruleThreeCircles, ruleChain])(graph)
}
