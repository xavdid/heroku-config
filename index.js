'use strict'

exports.topic = {
  name: 'config'
}

exports.commands = [
  require('./commands/pull.js'),
  require('./commands/push.js')
]
