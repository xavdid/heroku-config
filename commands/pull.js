'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * pull (context, heroku) {
  let fname = context.flags.env // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname)
  }
  cli.debug(config)

  file.write(merge(config.remote, config.local, context.flags), fname)
}

module.exports = {
  topic: 'config',
  command: 'mypull',
  description: 'pulls env variables from heroku',
  help: 'this is helpful?',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(pull)),
  flags: require('../util/flags')
}
