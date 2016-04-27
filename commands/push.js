'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')

function * push (context, heroku) {
  let config = yield heroku.get(`/apps/${context.app}/config-vars`)
  let res = merge({}, config, context.flags)
  cli.debug(config)
  cli.debug(res)
// cli.debug(merge({a: 1}, {b: 2}, context.flags))
}

module.exports = {
  topic: 'config',
  command: 'mypush',
  description: 'pushes local env variables to heroku',
  help: 'this is more helpful?',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(push)),
  flags: require('../util/flags')
}
