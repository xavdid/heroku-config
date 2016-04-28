'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * pull (context, heroku) {
  let config = yield heroku.get(`/apps/${context.app}/config-vars`)
  let fname = context.flags.env || '.env'
  file.write(merge(config, file.read(fname), context.flags), fname)
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
