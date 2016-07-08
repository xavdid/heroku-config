'use strict'

// I only need this if I'm creating a new topic, which I'm not
// exports.topic = {
//   name: 'config'
// }

exports.commands = [
  require('./commands/pull.js'),
  require('./commands/push.js')
]
