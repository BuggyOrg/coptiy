import * as Graph from '@buggyorg/graphtools'
import * as Rewrite from '@buggyorg/rewrite'
import * as _ from 'lodash'

// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY
// TRIANGLE   = ◭ = eg. IFs

// First the old port rules
/** Only cirlce sucessors
 *     🞅
 *  ref  ref
 *  🞅     🞅
 */
let ruleThreeCircles = Rewrite.applyPort(
  (port, graph) => {
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
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref',
      'rule_3_c': true
    })
    graph = Graph.replacePort(port, newPort, graph)
    return Graph.set({'refs-to': Graph.successors(port, graph)}, port, graph)
  }, {noIsomorphCheck: true}
)

/** Chains with only one child/sucessor
 *  🞅
 * ref
 *  🞏
 * ref
 *  🞏
 */
let ruleChain = Rewrite.applyPort(
  (port, graph) => {
    if (port['rule_chain']) {
      return false
    }

    if (Graph.successors(port, graph).length === 1) {
      return port
    }
    return false
  },
  (port, graph) => {
    var newPort = _.assign(_.cloneDeep(port), {
      'copy-as': 'ref',
      'rule_chain': true
    })
    graph = Graph.replacePort(port, newPort, graph)
    return Graph.set({'refs-to': Graph.successors(port, graph)}, port, graph)
  }, {noIsomorphCheck: true}
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
  (port, graph) => {
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
    var newPort = _.assign(_.cloneDeep(port), {
      'rule_2': true,
      'copy-as': 'ref&copy'
    })
    graph = Graph.replacePort(port, newPort, graph)
    graph = Graph.set({'refs-to': [obj.sucessors[0]]}, port, graph)
    graph = Graph.set({'copies-to': obj.sucessors.slice(1)}, port, graph)
    return graph
  }, {noIsomorphCheck: true}
)

export function addRefs (graph) {
  return Rewrite.rewrite([ruleThreeCircles, ruleChain, ruleTwo])(graph)
}

// New Node Rules start from here
// CIRCLE     = 🞅 = REF
// RECTANGLE  = 🞏 = COPY

let dup = Graph.compound({
  ref: 'DUP',
  ports: [
    {port: 'in', kind: 'input', type: 'generic'},
    {port: 'out0', kind: 'output', type: 'generic'},
  {port: 'out1', kind: 'output', type: 'generic'}]})

/**
 * From:
 *   A
 * B   C
 * To:
 *    A
 *   DUP
 *  B   C
 */
let simpleDupRule = Rewrite.applyPort(
  (port, graph) => Graph.successors(port, graph).length > 1,
  (port, graph) => {
    const succ = Graph.successors(port, graph).slice(0, 2)
    return Graph.flow(
      succ.map((s) => Graph.removeEdge(Graph.inIncident(s, graph))),
      Graph.Let(Graph.addNode(dup), (dupNode, graph) => Graph.flow(
        Graph.addEdge({from: port, to: {node: dupNode.id, port: 'in'}}),
        succ.map((s, idx) => Graph.addEdge({from: {node: dupNode.id, port: 'out' + idx}, to: s}))
      )(graph)
      ))(graph)
  },
  {noIsomorphCheck: true}
)

// change a DUP to a DUPREF if both successors are refs
let setDupRefRule = Rewrite.applyNode(
  (node, graph) => node.ref === 'DUP' &&
    Graph.successors(node, graph).every((sn) => Graph.get('copy-type', sn, graph) === '🞅'),
  (node, graph) => {
    let newNode = node
    newNode.ref = 'DUPREF'
    return Graph.replaceNode(node, newNode, graph)
  },
  {noIsomorphCheck: true}
)

let setDupRefSeqRule = Rewrite.applyNode(
  (node, graph) => {
    let succ = Graph.successors(node, graph)
    return node.ref === 'DUP' &&
      succ.some((sn) => Graph.get('copy-type', sn, graph) === '🞅') &&
      succ.some((sn) => Graph.get('copy-type', sn, graph) === '🞏')
  },
  (node, graph) => {
    let newNode = node
    newNode.ref = 'DUPSEQ'
    // TODO:
    //  set out0 for 🞅 Node (1st)
    //  set out1 for 🞏 Node (2nd)
    return Graph.replaceNode(node, newNode, graph)
  },
  {noIsomorphCheck: true}
)

export function executeForPairs (from, to, call, init) {
  return from.reduce((graphA, a) => to.reduce((graphB, b) => call(a, b, graphB), graphA), init)
}

let addSeqNodes = Rewrite.applyNode(
  (node, graph) => {
    let succ = Graph.successors(node, graph)
    let refs = succ.filter(a => Graph.get('copy-type', a, graph) === '🞅')
    let copies = succ.filter(a => Graph.get('copy-type', a, graph) === '🞏')
    // console.log('A', refs.length, copies.length, Graph.successors(refs[0], graph).some(b => b === copies[0]))
    return refs.length > 0 && copies.length > 0 && !Graph.successors(refs[0], graph).some(b => Graph.node(b, graph) === copies[0]) && {node, refs, copies}
  },
  ({node, refs, copies}, graph) => {
    return executeForPairs(refs, copies, (a, b, g) => Graph.addEdge({from: a.id, to: b.id, layer: 'sequence'}, graph))
  },
  { noIsomorphCheck: true }
)

export function addNodes (graph) {
  return Rewrite.rewrite([simpleDupRule, setDupRefRule, setDupRefSeqRule])(graph)
}
