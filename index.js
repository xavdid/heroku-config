'use strict'

exports.topic = {
  name: 'config',
  description: 'this gets overwritten anyway?'
}

exports.commands = [
  require('./commands/pull.js'),
  require('./commands/push.js')
]
