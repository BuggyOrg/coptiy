#!/usr/bin/env node
import yargs from 'yargs'
import * as Graph from '@buggyorg/graphtools'
import * as api from './api'
import * as cli from 'cli-ext'

function toCleanJSON (inputGraph) {
  let graph = api.addRefs(Graph.fromJSON(JSON.parse(inputGraph)))
  graph = Graph.toJSON(graph)
  console.log(JSON.stringify(graph, null, 2))
}

const version = require('../package.json').version

const argv = yargs
  .usage([
    'Coptiy CLI [version ' + version + ']',
    'Usage: ./$0 [command] [options]',
    '       ./$0 <file> [options]'
  ].join('\n'))
  .command(['rewrite [graph]'], 'Rewrite the graph', {}, (argv) => {
    try {
      toCleanJSON(argv.graph)
    } catch (err) {
      console.log('ERROR:', err.message)
      process.exitCode = 1
    }
  })
  .command(['input [file]'], 'Use the stdin input as graph or if none is given open an editor', {}, (argv) => {
    if (!argv.file) {
      argv.file = ''
    }
    cli.input(argv.file, {fileType: '.graph'}).then(toCleanJSON).catch((err) => {
      console.log('ERROR:', err.message)
      process.exitCode = 1
    })
  })
  .command(['edit [file]'], 'Opens an editor to edit the file [file] and use its content as graph', {}, (argv) => {
    cli.edit(argv.file).then(toCleanJSON).catch((err) => {
      console.log('ERROR:', err.message)
      process.exitCode = 1
    })
  })
  .help()
  .completion('completion')
  .argv

var firstArg = argv._[0]
if (firstArg !== 'rewrite' && firstArg !== 'input' && firstArg !== 'edit') {
  cli.input(firstArg, {fileType: '.graph'}).then(toCleanJSON).catch((err) => {
    console.log('ERROR:', err.message)
    process.exitCode = 1
  })
}
