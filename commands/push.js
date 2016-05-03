'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * pull (context, heroku) {
  let fname = context.flags.file // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname)
  }
  // cli.debug(config)
  let res = merge(config.local, config.remote, context.flags)
  yield heroku.patch(`/apps/${context.app}/config-vars`, res)
  cli.log('Successuflly wrote settings to heroku!')
}

module.exports = {
  topic: 'config',
  command: 'mypush',
  description: 'pushes env variables to heroku',
  help: 'this is more helpful?',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(pull)),
  flags: require('../util/flags')
}
