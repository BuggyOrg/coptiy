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
    if (port['rule_3_c']) {
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
    // console.log('ruleThreeCircles: replacing one')
    var node = Graph.node(port, graph)
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref',
      'rule_3_c': true
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
    if (port['rule_chain']) {
      return false
    }

    if (Graph.successors(port, graph).length === 1) {
      return port
    }
    return false
  },
  (port, graph) => {
    // console.log('ruleChain: replacing one')
    var node = Graph.node(port, graph)
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref',
      'rule_chain': true
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
let ruleTwo = Rewrite.applyPort(
  (node, port, graph) => {
    var sucessors = Graph.successors(port, graph)
    if (port['rule_2'] || sucessors.length < 2) {
      return false
    }
    if (sucessors.every((sn) => Graph.get('copy-type', sn, graph) === '🞅')) {
      return false
    }
    return {port, sucessors}
  },
  (obj, graph) => {
    var port = obj.port
    var node = Graph.node(port, graph)
    var newPort = _.assign(_.cloneDeep(port), {
      'rule_2': true,
      'copy-as': 'ref&copy'
    })
    graph = Rewrite.replacePort(node, port, newPort, graph)
    graph = Graph.set({'refs-to': [ obj.sucessors[0] ]}, port, graph)
    graph = Graph.set({'copies-to': obj.sucessors.slice(1)}, port, graph)
    return graph
  }
)

export function addRefs (graph) {
  return Rewrite.rewrite([ruleThreeCircles, ruleChain, ruleTwo])(graph)
}
